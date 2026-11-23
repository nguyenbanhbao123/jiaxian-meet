#pragma once

#include <cstdint>
#include <optional>
#include <string>

struct User {
  int64_t id = 0;
  std::string username;
  std::string email;
  std::string password;
  std::optional<std::string> avatar_url;
  std::string created_at;
  std::string updated_at;
  std::optional<std::string> deleted_at;
};

struct UserLoginRequest {
  std::string username;
  std::string password;
};

struct CreateUserRequest {
  std::string username;
  std::string email;
  std::string password;
};

// Outgoing API response (safe to send to React)
struct UserResponse {
  int64_t id = 0;
  std::string username;
  std::optional<std::string> avatar_url;
};