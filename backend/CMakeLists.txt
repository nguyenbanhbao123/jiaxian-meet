cmake_minimum_required(VERSION 3.16)
project(jiaxian-meet LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(libpqxx CONFIG REQUIRED)
find_package(Threads REQUIRED)
find_package(Drogon CONFIG REQUIRED)

add_executable(my_app
  src/auth_service.cpp
  src/database.cpp
  src/repository.cpp
  src/router.cpp
  src/server.cpp
  src/main.cpp
)

target_include_directories(my_app PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(my_app PRIVATE libpqxx::pqxx) 
target_link_libraries(my_app PRIVATE Drogon::Drogon libpqxx::pqxx Threads::Threads)