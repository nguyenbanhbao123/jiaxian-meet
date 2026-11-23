#include "server.hpp"
#include "logger.hpp"

#include <algorithm>
#include <cctype>
#include <iostream>
#include <sstream>
#include <chrono>

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

namespace http_protocol {

// Registers a handler function for HTTP GET requests on the given path.
void Server::get(const std::string& path, Handler handler) {
  routes_["GET " + path] = std::move(handler);
}

// Registers a handler function for HTTP POST requests on the given path.
void Server::post(const std::string& path, Handler handler) {
  routes_["POST " + path] = std::move(handler);
}

// Sets the allowed origin for Cross-Origin Resource Sharing (CORS) headers.
void Server::use_cors(const std::string& origin) {
  cors_origin_ = origin;
}

// Converts a string to lowercase for case-insensitive HTTP header lookups.
std::string Server::to_lower(std::string s) {
  std::transform(
    s.begin(), s.end(), s.begin(),
    [](unsigned char c) {
      return static_cast<char>(std::tolower(c));
    }
  );
  return s;
}

// Loops send() until all bytes in data are transmitted over the socket.
bool Server::send_all(int fd, const std::string& data) {
  size_t sent_total = 0;

  while (sent_total < data.size()) {
    ssize_t n = send(fd, data.data() + sent_total, data.size() - sent_total, 0);
    if (n <= 0) return false;
    sent_total += static_cast<size_t>(n);
  }

  return true;
}

// Reads and parses an incoming HTTP/1.1 request (headers and body) from the client socket.
bool Server::read_request(int fd, Request& req) {
  std::string buf;
  char chunk[4096];
  size_t header_end = std::string::npos;

  while ((header_end = buf.find("\r\n\r\n")) == std::string::npos) {
    ssize_t n = recv(fd, chunk, sizeof(chunk), 0);
    if (n <= 0) return false;
    buf.append(chunk, static_cast<size_t>(n));
  }

  std::istringstream stream(buf.substr(0, header_end));
  std::string version;
  stream >> req.method >> req.path >> version;

  std::string line;
  std::getline(stream, line);
  while (std::getline(stream, line)) {
    if (!line.empty() && line.back() == '\r') line.pop_back();
    auto colon = line.find(':');
    if (colon != std::string::npos) {
      std::string key = to_lower(line.substr(0, colon));
      std::string val = line.substr(colon + 1);
      if (!val.empty() && val[0] == ' ') val.erase(0, 1);
      req.headers[key] = val;
    }
  }

  size_t content_length = 0;
  if (auto it = req.headers.find("content-length"); it != req.headers.end()) {
    content_length = std::stoul(it->second);
  }

  std::string body = buf.substr(header_end + 4);
  while (body.size() < content_length) {
    ssize_t n = recv(fd, chunk, sizeof(chunk), 0);
    if (n <= 0) return false;
    body.append(chunk, static_cast<size_t>(n));
  }

  req.body = body.substr(0, content_length);
  return true;
}

// Attaches configured CORS headers to an outgoing HTTP response.
void Server::apply_cors(Response& res) const {
  if (cors_origin_.empty()) return;
  res.set_header("Access-Control-Allow-Origin", cors_origin_);
  res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");

}

// Processes a single client connection: reads the request, dispatches to a route, and sends the response.
void Server::handle_client(int fd) {
  auto start = std::chrono::steady_clock::now();

  Request req;
  if (!read_request(fd, req)) return;

  Response res;
  apply_cors(res);

  if (req.method == "OPTIONS") {
    res.set_status(204);
    res.set_status_text("No Content");
  } else if (auto it = routes_.find(req.method + " " + req.path); it != routes_.end()) {
    it->second(req, res);
  } else {
    res.set_json(R"({"error":"Not Found"})", 404, "Not Found");
  }

  auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
    std::chrono::steady_clock::now() - start
  ).count();

  http_protocol::info(
    req.method + " " + req.path + " -> " +
    std::to_string(res.get_status()) + " (" + std::to_string(ms) + "ms)"
  );

  send_all(fd, res.serialize());
}

// Creates a TCP socket, binds to the specified port, and accepts incoming connections in a loop.
bool Server::listen(uint16_t port) {
  int opt = 1;
  int server_fd = socket(AF_INET, SOCK_STREAM, 0);
  if (server_fd < 0) return false;

  setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

  sockaddr_in addr{};
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_port = htons(port);

  if (bind(server_fd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0 ||
      ::listen(server_fd, 64) < 0) {
    close(server_fd);
    return false;
  }

  std::cout << "Listening on port " << port << '\n';

  while (true) {
    int client_fd = accept(server_fd, nullptr, nullptr);
    if (client_fd < 0) continue;
    handle_client(client_fd);
    close(client_fd);
  }

  close(server_fd);
  return true;
}

} // namespace http_protocol