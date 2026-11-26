#pragma once

#include "types.hpp"
#include <optional>
#include <stdexcept>
#include <string>

class Database;

// The repository's own error type, so upper layers never see pqxx exceptions
struct DuplicateUserError : std::runtime_error {
  using std::runtime_error::runtime_error;
};

class UserRepository {
public:
  explicit UserRepository(Database& db);

  std::optional<User> find_by_id(int64_t id) const;
  std::optional<User> find_by_username(const std::string& username) const;
  User create(const std::string& username,
              const std::string& email,
              const std::string& password);   // plain text for now

private:
  Database& db_;
};