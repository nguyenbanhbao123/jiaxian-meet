#include "database/repository.hpp"

#include <string>
#include <tuple>
#include <utility>

namespace {

// Order must match UserRow and the members of User
constexpr const char* kUserColumns =
  "id, username, email, password, "
  "COALESCE(avatar_url, ''), "
  "created_at::text, "
  "COALESCE(updated_at::text, ''), "
  "COALESCE(deleted_at::text, '')";

using UserRow = std::tuple<
  int64_t,
  std::string,  
  std::string,  
  std::string,
  std::string,  
  std::string,  
  std::string,  
  std::string   
>;

std::optional<std::string> non_empty(std::string s) {
  if (s.empty()) return std::nullopt;
  return s;
}

User to_user(UserRow row) {
  auto& [id, username, email, password, avatar_url, created_at, updated_at, deleted_at] = row;
  return User{
    id,
    std::move(username),
    std::move(email),
    std::move(password),
    non_empty(std::move(avatar_url)),
    std::move(created_at),
    std::move(updated_at),
    non_empty(std::move(deleted_at))
  };
}

} // namespace

UserRepository::UserRepository(pqxx::connection& conn) : conn_(conn) {}

bool UserRepository::is_connected() const {
  return conn_.is_open();
}

std::vector<User> UserRepository::find_all() const {
  pqxx::read_transaction txn{conn_};

  std::vector<User> users;
  for (auto row : txn.query<int64_t, std::string, std::string, std::string,
                            std::string, std::string, std::string, std::string>(
        std::string("SELECT ") + kUserColumns + 
        " FROM users WHERE deleted_at IS NULL ORDER BY id")) {
    users.push_back(to_user(std::move(row)));
  }
  return users;
}

std::optional<User> UserRepository::find_by_id(int64_t id) const {
  pqxx::read_transaction txn{conn_};

  auto row = txn.query01<int64_t, std::string, std::string, std::string,
                         std::string, std::string, std::string, std::string>(
    std::string("SELECT ") + kUserColumns +
    " FROM users WHERE id = $1 AND deleted_at IS NULL",
    pqxx::params{id});

  if (!row) return std::nullopt;
  return to_user(std::move(*row));
}

std::optional<User> UserRepository::find_by_username(std::string_view username) const {
  pqxx::read_transaction txn{conn_};

  auto row = txn.query01<int64_t, std::string, std::string, std::string,
                         std::string, std::string, std::string, std::string>(
    std::string("SELECT ") + kUserColumns +
    " FROM users WHERE username = $1 AND deleted_at IS NULL",
    pqxx::params{std::string{username}});

  if (!row) return std::nullopt;
  return to_user(std::move(*row));
}

User UserRepository::create(std::string_view username,
                            std::string_view email,
                            std::string_view password) {
  pqxx::work txn{conn_};

  auto row = txn.query1<int64_t, std::string, std::string, std::string,
                                          std::string, std::string, std::string, std::string>(
    std::string("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING ") + kUserColumns,
    pqxx::params{std::string{username}, std::string{email}, std::string{password}});

  txn.commit();
  return to_user(std::move(row));
}

bool UserRepository::soft_delete(int64_t id) {
  pqxx::work txn{conn_};

  auto result = txn.exec(
    "UPDATE users SET deleted_at = now(), updated_at = now() "
    "WHERE id = $1 AND deleted_at IS NULL",
    pqxx::params{id});

  txn.commit();
  return result.affected_rows() > 0;
}