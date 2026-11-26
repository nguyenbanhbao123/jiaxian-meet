#include "router.hpp"
#include "database.hpp"
#include "auth_service.hpp"
#include <drogon/drogon.h>

namespace {

using drogon::HttpResponsePtr;
using drogon::HttpStatusCode;
using Callback = std::function<void(const HttpResponsePtr&)>;

HttpResponsePtr json_response(const Json::Value& body, HttpStatusCode code) {
  auto res = drogon::HttpResponse::newHttpJsonResponse(body);
  res->setStatusCode(code);
  return res;
}

HttpResponsePtr error_response(HttpStatusCode code, const std::string& message) {
  Json::Value j;
  j["error"] = message;
  return json_response(j, code);
}

Json::Value to_json(const UserResponse& u) {
  Json::Value j;
  j["id"] = static_cast<Json::Int64>(u.id);
  j["username"] = u.username;
  j["email"] = u.email;
  j["avatar_url"] = u.avatar_url ? Json::Value(*u.avatar_url)
                                 : Json::Value(Json::nullValue);
  return j;
}

HttpStatusCode status_for(AuthError e) {
  switch (e) {
    case AuthError::InvalidInput:       return drogon::k400BadRequest;
    case AuthError::InvalidCredentials: return drogon::k401Unauthorized;
    case AuthError::Conflict:           return drogon::k409Conflict;
    default:                            return drogon::k500InternalServerError;
  }
}

bool read_string(const Json::Value& j, const char* key, std::string& out) {
  if (!j.isObject() || !j.isMember(key) || !j[key].isString()) return false;
  out = j[key].asString();
  return true;
}

} // namespace

Router::Router(AuthService& auth, Database& db) : auth_(auth), db_(db) {}

void Router::register_routes() {
  // GET /conn_check -> database stats
  drogon::app().registerHandler(
    "/conn_check",
    [this](const drogon::HttpRequestPtr&, Callback&& cb) {
      const DbStats s = db_.stats();

      Json::Value j;
      j["status"] = s.connected ? "connected" : "disconnected";
      j["database"] = s.database;
      j["server_version"] = s.server_version;
      j["latency_ms"] = s.latency_ms;
      j["pool"]["size"] = static_cast<Json::UInt64>(s.pool_size);
      j["pool"]["idle"] = static_cast<Json::UInt64>(s.idle);

      cb(json_response(j, s.connected ? drogon::k200OK
                                      : drogon::k503ServiceUnavailable));
    },
    {drogon::Get});

  // POST /register -> 201 + user
  drogon::app().registerHandler(
    "/register",
    [this](const drogon::HttpRequestPtr& req, Callback&& cb) {
      auto body = req->getJsonObject();
      RegisterInput in;
      if (!body || !read_string(*body, "username", in.username) ||
          !read_string(*body, "email", in.email) ||
          !read_string(*body, "password", in.password)) {
        cb(error_response(drogon::k400BadRequest,
                          "body must be JSON with string fields username, email, password"));
        return;
      }

      const AuthResult r = auth_.register_user(in);
      if (!r.ok()) {
        cb(error_response(status_for(r.error), r.message));
        return;
      }
      cb(json_response(to_json(*r.user), drogon::k201Created));
    },
    {drogon::Post});

  // POST /login -> 200 + user
  drogon::app().registerHandler(
    "/login",
    [this](const drogon::HttpRequestPtr& req, Callback&& cb) {
      auto body = req->getJsonObject();
      LoginInput in;
      if (!body || !read_string(*body, "username", in.username) ||
          !read_string(*body, "password", in.password)) {
        cb(error_response(drogon::k400BadRequest,
                          "body must be JSON with string fields username, password"));
        return;
      }

      const AuthResult r = auth_.login(in);
      if (!r.ok()) {
        cb(error_response(status_for(r.error), r.message));
        return;
      }

      Json::Value j;
      j["message"] = "Login successful";
      j["user"] = to_json(*r.user);
      cb(json_response(j, drogon::k200OK));
    },
    {drogon::Post});
}