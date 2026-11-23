#include "message.hpp"
#include <sstream>

namespace http_protocol {

Response::Response() : status_(200), status_text_("OK") {}

void Response::set_status(int code) {
  status_ = code;
}

void Response::set_status_text(const std::string& text) {
  status_text_ = text;
}

void Response::set_header(const std::string& key, const std::string& value) {
  headers_[key] = value;
}

void Response::set_body(const std::string& body) {
  body_ = body;
}

void Response::set_json(const std::string& jsonStr, int code, const std::string& text) {
  status_ = code;
  status_text_ = text;
  headers_["Content-Type"] = "application/json";
  body_ = jsonStr;
}

int Response::get_status() const {
  return status_;
}

std::string Response::serialize() const {
  std::ostringstream out;
  out << "HTTP/1.1 " << status_ << " " << status_text_ << "\r\n";
  for (const auto& [k, v] : headers_) {
    out << k << ": " << v << "\r\n";
  }
  out << "Content-Length: " << body_.size() << "\r\n"
      << "Connection: close\r\n\r\n"
      << body_;
  return out.str();
}

}