
#pragma once

#include <cstdint>
#include <functional>
#include <string>
#include <unordered_map>

#include "message.hpp"

namespace http_protocol {

using Handler = std::function<void(
  const Request&,
  Response&
)>;

class Server {
public:
  Server() = default;
  ~Server() = default;

  // Route registration
  void get(const std::string& path, Handler handler);
  void post(const std::string& path, Handler handler);

  // Middleware configuration
  void use_cors(const std::string& origin);

  // Start server
  bool listen(uint16_t port);

private:
  std::unordered_map<std::string, Handler> routes_;
  std::string cors_origin_;

  static std::string to_lower(std::string s);
  static bool send_all(int fd, const std::string& data);
  static bool read_request(int fd, Request& req);
  void apply_cors(Response& res) const;
  void handle_client(int fd);
};

} // namespace http_protocol
