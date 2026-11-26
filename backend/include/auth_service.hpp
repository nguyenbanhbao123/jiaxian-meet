#pragma once

#include "types.hpp"
#include <optional>
#include <string>

class UserRepository;

enum class AuthError { None, InvalidInput, Conflict, InvalidCredentials, Internal };

struct RegisterInput { std::string username, email, password; };
struct LoginInput    { std::string username, password; };

struct AuthResult {
  AuthError error = AuthError::None;
  std::string message;
  std::optional<UserResponse> user;

  bool ok() const { return error == AuthError::None; }
};

class AuthService {
public:
  explicit AuthService(UserRepository& repo);

  AuthResult register_user(const RegisterInput& in) const;
  AuthResult login(const LoginInput& in) const;

private:
  UserRepository& repo_;
};