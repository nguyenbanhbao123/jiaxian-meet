#pragma once

#include <chrono>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <mutex>
#include <sstream>
#include <string_view>

namespace http_protocol {

enum class Level { Debug, Info, Warn, Error };

inline std::mutex& log_mutex() {
  static std::mutex m;
  return m;
}

inline const char* level_str(Level level) {
  switch (level) {
    case Level::Debug: return "DEBUG";
    case Level::Info:  return "INFO";
    case Level::Warn:  return "WARN";
    case Level::Error: return "ERROR";
  }
  return "INFO ";
}

inline void log(Level level, std::string_view msg) {
  auto now = std::chrono::system_clock::now();
  std::time_t t = std::chrono::system_clock::to_time_t(now);
  std::tm tm_buf{};
  localtime_r(&t, &tm_buf);

  std::ostringstream oss;
  oss << '[' << std::put_time(&tm_buf, "%H:%M:%S") << "] "
      << '[' << level_str(level) << "] "
      << msg << '\n';

  std::lock_guard<std::mutex> lock(log_mutex());
  auto& stream = (level == Level::Error) ? std::cerr : std::cout;
  stream << oss.str() << std::flush;
}

inline void info(std::string_view msg)  { log(Level::Info, msg); }
inline void warn(std::string_view msg)  { log(Level::Warn, msg); }
inline void error(std::string_view msg) { log(Level::Error, msg); }
inline void debug(std::string_view msg) { log(Level::Debug, msg); }

} // namespace http_protocol