#include "repository.hpp"
#include "database.hpp"
#include <pqxx/pqxx>
#include <tuple>
#include <utility>

namespace {

// Order must match UserRow and User's members
constexpr const char* kUserColumns =
  "id, username, email, password, "
  "COALESCE(avatar_url, ''), "
  "created_at::text, "
  "COALESCE(updated_at::text, ''), "
  "COALESCE(deleted_at::text, '')";

using UserRow = std::tuple<int64_t, std::string, std::string, std::string,
                           std::string, std::string, std::string, std::string>;

std::optional<std::string> non_empty(std::string s) {
  if (s.empty()) return std::nullopt;
  return s;
}

User to_user(UserRow row) {
  auto& [id, username, email, password, avatar_url,
         created_at, updated_at, deleted_at] = row;
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

UserRepository::UserRepository(Database& db) : db_(db) {}

std::optional<User> UserRepository::find_by_id(int64_t id) const {
  auto lease = db_.acquire();
  pqxx::read_transaction txn{lease.get()};

  auto row = txn.query01<int64_t, std::string, std::string, std::string,
                         std::string, std::string, std::string, std::string>(
    std::string("SELECT ") + kUserColumns +
    " FROM users WHERE id = $1 AND deleted_at IS NULL",
    pqxx::params{id});

  if (!row) return std::nullopt;
  return to_user(std::move(*row));
}

std::optional<User> UserRepository::find_by_username(const std::string& username) const {
  auto lease = db_.acquire();
  pqxx::read_transaction txn{lease.get()};

  auto row = txn.query01<int64_t, std::string, std::string, std::string,
                         std::string, std::string, std::string, std::string>(
    std::string("SELECT ") + kUserColumns +
    " FROM users WHERE username = $1 AND deleted_at IS NULL",
    pqxx::params{username});

  if (!row) return std::nullopt;
  return to_user(std::move(*row));
}

User UserRepository::create(const std::string& username,
                            const std::string& email,
                            const std::string& password) {
  auto lease = db_.acquire();
  try {
    pqxx::work txn{lease.get()};

    auto row = txn.query1<int64_t, std::string, std::string, std::string,
                          std::string, std::string, std::string, std::string>(
      std::string("INSERT INTO users (username, email, password) "
                  "VALUES ($1, $2, $3) RETURNING ") + kUserColumns,
      pqxx::params{username, email, password});

    txn.commit();
    return to_user(std::move(row));
  } catch (const pqxx::unique_violation&) {
    throw DuplicateUserError("username or email is already in use");
  }
}