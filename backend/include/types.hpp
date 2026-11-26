#pragma once

#include <cstdint>
#include <optional>
#include <string>

struct User {
  int64_t id = 0;
  std::string username;
  std::string email;
  std::string password;                  // plain text for now (no hash yet)
  std::optional<std::string> avatar_url;
  std::string created_at;
  std::string updated_at;
  std::optional<std::string> deleted_at;
};

// Safe to send to the frontend
struct UserResponse {
  int64_t id = 0;
  std::string username;
  std::string email;
  std::optional<std::string> avatar_url;
};