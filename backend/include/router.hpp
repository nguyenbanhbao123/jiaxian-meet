#pragma once

class AuthService;
class Database;

class Router {
public:
  Router(AuthService& auth, Database& db);
  void register_routes();   // call before drogon::app().run()

private:
  AuthService& auth_;
  Database& db_;
};