cmake_minimum_required(VERSION 3.16)
project(jiaxian-meet LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(libpqxx CONFIG REQUIRED)

add_executable(my_app
  src/repository.cpp
  src/api.cpp
  src/server.cpp
  src/message.cpp
)

target_include_directories(my_app PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(my_app PRIVATE 
  libpqxx::pqxx
) 