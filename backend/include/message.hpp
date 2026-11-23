#pragma once

#include <string>
#include <unordered_map>

namespace http_protocol {

struct Request {
  std::string method;
  std::string path;
  std::unordered_map<std::string, std::string> headers;
  std::string body;
};

class Response {
public:
  Response();

  // Setter response data
  void set_status(int code);
  void set_status_text(const std::string& text);
  void set_header(const std::string& key, const std::string& value);
  void set_body(const std::string& body);
  void set_json(const std::string& jsonStr, int code = 200, const std::string& text = "OK");

  // Getter
  int get_status() const;

  // Generate HTTP response
  std::string serialize() const;

private:
  int status_;
  std::string status_text_;
  std::unordered_map<std::string, std::string> headers_;
  std::string body_;  
};

} // namespace http_protocol
