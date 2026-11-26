#pragma once

#include "router.hpp"
#include "database.hpp"
#include "repository.hpp"
#include "auth_service.hpp"
#include <cstddef>
#include <cstdint>
#include <string>

struct ServerConfig {
  std::string db_conninfo;
  std::string host = "0.0.0.0";
  uint16_t port = 8080;
  std::size_t threads = 4;
  std::size_t db_pool = 4;
  std::string cors_origin = "*";
  std::string log_dir;
  std::string log_level = "info";   // trace | debug | info | warn | error | fatal

  static ServerConfig from_env();   // reads DATABASE_URL, throws if missing
};

class Server {
public:
  explicit Server(ServerConfig cfg);
  void run();   // blocks until shutdown (Ctrl+C)

private:
  void install_logging();
  void install_cors();

  // Declaration order = construction order
  ServerConfig cfg_;
  Database db_;
  UserRepository repo_;
  AuthService auth_;
  Router router_;
};