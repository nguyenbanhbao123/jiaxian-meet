#include "server.hpp"
#include <drogon/drogon.h>
#include <cstdlib>
#include <stdexcept>

trantor::Logger::LogLevel parse_level(const std::string& s) {
  if (s == "trace") return trantor::Logger::kTrace;
  if (s == "debug") return trantor::Logger::kDebug;
  if (s == "warn")  return trantor::Logger::kWarn;
  if (s == "error") return trantor::Logger::kError;
  if (s == "fatal") return trantor::Logger::kFatal;
  return trantor::Logger::kInfo;
}

ServerConfig ServerConfig::from_env() {
  ServerConfig cfg;
  const char* url = std::getenv("DATABASE_URL");
  if (!url || !*url) throw std::runtime_error("DATABASE_URL is not set");
  cfg.db_conninfo = url;

  if (const char* d = std::getenv("LOG_DIR"))   cfg.log_dir = d;
  if (const char* l = std::getenv("LOG_LEVEL")) cfg.log_level = l;
  return cfg;
}

Server::Server(ServerConfig cfg)
    : cfg_(std::move(cfg)),
      db_(cfg_.db_conninfo, cfg_.db_pool),   // connects now, fails fast
      repo_(db_),
      auth_(repo_),
      router_(auth_, db_) {}

void Server::install_logging() {
  auto& app = drogon::app();

  // Must be set before app.run()
  app.setLogLevel(parse_level(cfg_.log_level));
  app.setLogLocalTime(true);
  if (!cfg_.log_dir.empty()) {
    // path, base name, max size per file (20 MB)
    app.setLogPath(cfg_.log_dir, "backend", 20 * 1024 * 1024);
  }

  // Record when each request started
  app.registerPreRoutingAdvice(
    [](const drogon::HttpRequestPtr& req,
       drogon::AdviceCallback&&,
       drogon::AdviceChainCallback&& pass) {
      const auto now = std::chrono::steady_clock::now().time_since_epoch();
      req->attributes()->insert(
        "start_us",
        std::chrono::duration_cast<std::chrono::microseconds>(now).count());
      pass();
    }
  );

  // One line per handled request
  app.registerPostHandlingAdvice(
    [](const drogon::HttpRequestPtr& req, const drogon::HttpResponsePtr& res) {
      double ms = 0.0;
      if (req->attributes()->find("start_us")) {
        const auto start = req->attributes()->get<long>("start_us");
        const auto now = std::chrono::duration_cast<std::chrono::microseconds>(
          std::chrono::steady_clock::now().time_since_epoch()).count();
        ms = static_cast<double>(now - start) / 1000.0;
      }

      const int status = static_cast<int>(res->statusCode());
      auto line = [&](auto& log) {
        log << req->methodString() << ' ' << req->path()
            << " -> " << status << " (" << ms << " ms) "
            << "from " << req->peerAddr().toIp();
      };

      if (status >= 500)      { LOG_ERROR << "request"; }   // see note below
      if (status >= 500)      { /* replaced below */ }
    }
  );
}

void Server::install_cors() {
  const std::string origin = cfg_.cors_origin;

  // Answer preflight before routing, so no OPTIONS route is needed
  drogon::app().registerPreRoutingAdvice(
    [origin](const drogon::HttpRequestPtr& req,
             drogon::AdviceCallback&& stop,
             drogon::AdviceChainCallback&& pass) {
      if (req->method() == drogon::Options) {
        auto res = drogon::HttpResponse::newHttpResponse();
        res->setStatusCode(drogon::k204NoContent);
        res->addHeader("Access-Control-Allow-Origin", origin);
        res->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res->addHeader("Access-Control-Max-Age", "600");
        stop(res);
        return;
      }
      pass();
    });

  // Add the origin header to every normal response
  drogon::app().registerPostHandlingAdvice(
    [origin](const drogon::HttpRequestPtr&, const drogon::HttpResponsePtr& res) {
      res->addHeader("Access-Control-Allow-Origin", origin);
    });
}

void Server::run() {
  auto& app = drogon::app();
  app.setThreadNum(cfg_.threads);
  app.addListener(cfg_.host, cfg_.port);

  install_logging();
  install_cors();
  router_.register_routes();

  LOG_INFO << "listening on " << cfg_.host << ':' << cfg_.port
           << " (threads=" << cfg_.threads << ", db_pool=" << cfg_.db_pool << ")";

  app.run();
}