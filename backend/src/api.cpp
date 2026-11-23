#include "server.hpp"
#include "database/repository.hpp"

#include <nlohmann/json.hpp>
#include <pqxx/pqxx>

#include <cstdlib>
#include <exception>
#include <iostream>
#include <mutex>
#include <optional>
#include <string>

using json = nlohmann::json;

namespace {

json opt_to_json(const std::optional<std::string>& v) {
  return v ? json(*v) : json(nullptr);
}

json empty_to_null(const std::string& v) {
  return v.empty() ? json(nullptr) : json(v);
}

// Full user for GET /users. Never includes the password.
json to_json(const User& u) {
  return {
    {"id", u.id},
    {"username", u.username},
    {"email", u.email},
    {"avatar_url", opt_to_json(u.avatar_url)},
    {"created_at", u.created_at},
    {"updated_at", empty_to_null(u.updated_at)}
  };
}

// Minimal user for login / signup responses
json to_public_json(const User& u) {
  return {
    {"id", u.id},
    {"username", u.username},
    {"email", u.email},
    {"avatar_url", opt_to_json(u.avatar_url)}
  };
}

void send_error(http_protocol::Response& res, int status,
                const char* reason, const std::string& message) {
  res.set_json(json{{"error", message}}.dump(), status, reason);
}

std::string connection_string() {
  const char* env = std::getenv("DATABASE_URL");
  if (env) return env;
  // Local dev fallback (set DATABASE_URL with your password instead)
  return "host=localhost port=5432 dbname=jiaxian-db user=postgres";
}

} // namespace

int main() {
  try {
    pqxx::connection conn{connection_string()};
    UserRepository users{conn};

    // pqxx::connection is not thread-safe: serialize all DB access.
    std::mutex db_mutex;

    http_protocol::Server server;
    server.use_cors("*");

    // GET /connection
    server.get("/connection", [&](const http_protocol::Request&,
                                  http_protocol::Response& res) {
      std::lock_guard<std::mutex> lock(db_mutex);
      if (users.is_connected()) {
        res.set_json(R"({"status":"connected","database":"postgresql"})",
                     200, "OK");
      } else {
        res.set_json(R"({"status":"disconnected"})",
                     503, "Service Unavailable");
      }
    });

    // GET /users
    server.get("/users", [&](const http_protocol::Request&,
                             http_protocol::Response& res) {
      try {
        std::lock_guard<std::mutex> lock(db_mutex);
        json body = json::array();
        for (const auto& u : users.find_all()) {
          body.push_back(to_json(u));
        }
        res.set_json(body.dump(), 200, "OK");
      } catch (const std::exception& e) {
        std::cerr << "Database error: " << e.what() << '\n';
        send_error(res, 500, "Internal Server Error",
                   "Failed to retrieve users");
      }
    });

    // POST /login
    server.post("/login", [&](const http_protocol::Request& req,
                              http_protocol::Response& res) {
      UserLoginRequest input;
      try {
        auto body = json::parse(req.body);
        input.username = body.at("username").get<std::string>();
        input.password = body.at("password").get<std::string>();
      } catch (const json::exception&) {
        send_error(res, 400, "Bad Request",
                   "Body must be JSON with string fields username and password");
        return;
      }

      if (input.username.empty() || input.password.empty()) {
        send_error(res, 400, "Bad Request",
                   "username and password are required");
        return;
      }

      try {
        std::lock_guard<std::mutex> lock(db_mutex);
        auto user = users.find_by_username(input.username);

        // Same response for "no such user" and "wrong password"
        if (!user || input.password != user->password) {
          send_error(res, 401, "Unauthorized",
                     "Username or password is incorrect");
          return;
        }

        res.set_json(json{
          {"message", "Login successful"},
          {"user", to_public_json(*user)}
        }.dump(), 200, "OK");
      } catch (const std::exception& e) {
        std::cerr << "Login error: " << e.what() << '\n';
        send_error(res, 500, "Internal Server Error", "Login failed");
      }
    });

    // POST /create
    server.post("/create", [&](const http_protocol::Request& req,
                               http_protocol::Response& res) {
      CreateUserRequest input;
      try {
        auto body = json::parse(req.body);
        input.username = body.at("username").get<std::string>();
        input.email = body.at("email").get<std::string>();
        input.password = body.at("password").get<std::string>();
      } catch (const json::exception&) {
        send_error(res, 400, "Bad Request",
                   "Body must be JSON with string fields username, email and password");
        return;
      }

      if (input.username.empty() || input.email.empty() ||
          input.password.empty()) {
        send_error(res, 400, "Bad Request",
                   "username, email and password must not be empty");
        return;
      }

      try {
        std::lock_guard<std::mutex> lock(db_mutex);
        User created = users.create(input.username, input.email, input.password);
        res.set_json(to_public_json(created).dump(), 201, "Created");
      } catch (const pqxx::unique_violation&) {
        send_error(res, 409, "Conflict", "Username or email is already in use");
      } catch (const std::exception& e) {
        std::cerr << "Database error: " << e.what() << '\n';
        send_error(res, 500, "Internal Server Error", "Failed to create user");
      }
    });

    if (!server.listen(8080)) {
      std::cerr << "Failed to start server\n";
      return 1;
    }

  } catch (const std::exception& e) {
    std::cerr << "Application error: " << e.what() << '\n';
    return 1;
  }

  return 0;
}