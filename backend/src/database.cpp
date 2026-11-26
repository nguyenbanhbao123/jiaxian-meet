#include "database.hpp"
#include <trantor/utils/Logger.h>
#include <pqxx/pqxx>
#include <chrono>

Database::Lease::Lease(Database& owner, std::unique_ptr<pqxx::connection> conn)
    : owner_(&owner), conn_(std::move(conn)) {}

Database::Lease::Lease(Lease&& other) noexcept
    : owner_(other.owner_), conn_(std::move(other.conn_)) {
  other.owner_ = nullptr;
}

Database::Lease::~Lease() {
  if (owner_ && conn_) owner_->release(std::move(conn_));
}

pqxx::connection& Database::Lease::get() const { return *conn_; }

Database::Database(std::string conninfo, std::size_t pool_size)
    : conninfo_(std::move(conninfo)), pool_size_(pool_size) {
  // Fail fast at startup if the database is unreachable
  for (std::size_t i = 0; i < pool_size_; ++i) {
    idle_.push_back(std::make_unique<pqxx::connection>(conninfo_));
  }
  LOG_INFO << "database pool ready (" << pool_size_ << " connections)";
}

Database::~Database() = default;

Database::Lease Database::acquire() {
  std::unique_ptr<pqxx::connection> conn;
  {
    std::unique_lock<std::mutex> lock(mutex_);
    cv_.wait(lock, [this] { return !idle_.empty(); });
    conn = std::move(idle_.back());
    idle_.pop_back();
  }

  // Keep-alive: replace a connection that has closed
  if (!conn->is_open()) {
    LOG_WARN << "database connection was closed, reconnecting";
    try {
      conn = std::make_unique<pqxx::connection>(conninfo_);
      LOG_INFO << "database reconnected";
    } catch (const std::exception& e) {
      LOG_ERROR << "database reconnect failed: " << e.what();
      release(std::move(conn));
      throw;
    }
  }
  return Lease(*this, std::move(conn));
}

void Database::release(std::unique_ptr<pqxx::connection> conn) {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    idle_.push_back(std::move(conn));
  }
  cv_.notify_one();
}

DbStats Database::stats() {
  DbStats s;
  s.pool_size = pool_size_;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    s.idle = idle_.size();
  }

  try {
    auto lease = acquire();
    pqxx::read_transaction txn{lease.get()};

    const auto start = std::chrono::steady_clock::now();
    s.server_version = txn.query_value<std::string>("SELECT version()");
    const auto end = std::chrono::steady_clock::now();

    s.latency_ms = std::chrono::duration<double, std::milli>(end - start).count();
    s.database = lease.get().dbname();
    s.connected = true;
  } catch (const std::exception& e) {
    LOG_ERROR << "database health check failed: " << e.what();
    s.connected = false;
  }
  return s;
}