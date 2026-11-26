#include "auth_service.hpp"
#include "repository.hpp"
#include <iostream>
#include <trantor/utils/Logger.h>

namespace {

UserResponse to_response(const User& u) {
  return UserResponse{u.id, u.username, u.email, u.avatar_url};
}

AuthResult fail(AuthError e, std::string msg) {
  AuthResult r;
  r.error = e;
  r.message = std::move(msg);
  return r;
}

AuthResult success(UserResponse u) {
  AuthResult r;
  r.user = std::move(u);
  return r;
}

} // namespace

AuthService::AuthService(UserRepository& repo) : repo_(repo) {}

AuthResult AuthService::register_user(const RegisterInput& in) const {
  if (in.username.empty() || in.username.size() > 50)
    return fail(AuthError::InvalidInput, "username must be 1-50 characters");
  if (in.email.size() > 254 || in.email.find('@') == std::string::npos)
    return fail(AuthError::InvalidInput, "email is not valid");
  if (in.password.size() < 6)
    return fail(AuthError::InvalidInput, "password must be at least 6 characters");

  try {
    auto user = repo_.create(in.username, in.email, in.password);
    LOG_INFO << "user registered: id=" << user.id << " username=" << user.username;
    return success(to_response(user));
  } catch (const DuplicateUserError& e) {
    LOG_WARN << "register rejected (duplicate): username=" << in.username;
    return fail(AuthError::Conflict, "username or email is already in use");
  } catch (const std::exception& e) {
    LOG_ERROR << "register failed: " << e.what();
    return fail(AuthError::Internal, "registration failed");
  }
}

AuthResult AuthService::login(const LoginInput& in) const {
  if (in.username.empty() || in.password.empty())
    return fail(AuthError::InvalidInput, "username and password are required");

  try {
    auto user = repo_.find_by_username(in.username);

    // TODO: replace with a hash verify. Same message for both cases on purpose.
    if (!user || user->password != in.password) {
      LOG_WARN << "login failed: username=" << in.username;
      return fail(AuthError::InvalidCredentials, "username or password is incorrect");
    }

    LOG_INFO << "login ok: id=" << user->id;  
    return success(to_response(*user));
  } catch (const std::exception& e) {
    LOG_ERROR << "login error: " << e.what();
    return fail(AuthError::Internal, "login failed");
  }
}