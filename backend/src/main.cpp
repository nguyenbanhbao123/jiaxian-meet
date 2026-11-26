#include "server.hpp"
#include <exception>
#include <iostream>

int main() {
  try {
    Server server{ServerConfig::from_env()};
    server.run();
  } catch (const std::exception& e) {
    std::cerr << "[Fatal]]" << e.what() << '\n';
    return 1;
  }
  return 0;
}