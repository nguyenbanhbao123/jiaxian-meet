#pragma once

#include <condition_variable>
#include <cstddef>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

namespace pqxx { class connection; }

struct DbStats {
  bool connected = false;
  std::string database;
  std::string server_version;
  double latency_ms = 0.0;
  std::size_t pool_size = 0;
  std::size_t idle = 0;
};

class Database {
public:
  // RAII handle: returns the connection to the pool when destroyed
  class Lease {
  public:
    Lease(Database& owner, std::unique_ptr<pqxx::connection> conn);
    Lease(Lease&&) noexcept;
    Lease(const Lease&) = delete;
    Lease& operator=(const Lease&) = delete;
    Lease& operator=(Lease&&) = delete;
    ~Lease();

    pqxx::connection& get() const;

  private:
    Database* owner_;
    std::unique_ptr<pqxx::connection> conn_;
  };

  Database(std::string conninfo, std::size_t pool_size);
  ~Database();

  Database(const Database&) = delete;
  Database& operator=(const Database&) = delete;

  Lease acquire();   // blocks until a connection is free; reconnects if it died
  DbStats stats();

private:
  void release(std::unique_ptr<pqxx::connection> conn);

  std::string conninfo_;
  std::size_t pool_size_;
  std::mutex mutex_;
  std::condition_variable cv_;
  std::vector<std::unique_ptr<pqxx::connection>> idle_;
};