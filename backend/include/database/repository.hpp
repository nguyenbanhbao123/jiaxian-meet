#pragma once
#include "user.hpp"
#include <optional>
#include <vector>
#include <pqxx/pqxx>

class UserRepository {
public:
  explicit UserRepository(pqxx::connection& conn);

  UserRepository(const UserRepository&) = delete;
  UserRepository& operator=(const UserRepository&) = delete;

  bool is_connected() const;

  std::vector<User> find_all() const;
  std::optional<User> find_by_id(int64_t id) const;
  std::optional<User> find_by_username(std::string_view username) const;

  User create(
    std::string_view username,
    std::string_view email,
    std::string_view password);

  bool soft_delete(int64_t id);

private:
  pqxx::connection& conn_;
};