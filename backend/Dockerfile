# ============================================================
# Stage 1 — BUILDER
# ============================================================
FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Toolchain + Drogon's build deps + libpq/libpqxx headers
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential cmake git ca-certificates pkg-config \
        libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev \
        libc-ares-dev libbrotli-dev \
        libpq-dev libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Drogon to /usr/local (static, so nothing from /usr/local/lib is needed at runtime)
ARG DROGON_VERSION=v1.9.11
RUN git clone --depth 1 --branch ${DROGON_VERSION} \
        --recurse-submodules https://github.com/drogonframework/drogon.git /tmp/drogon \
    && cmake -S /tmp/drogon -B /tmp/drogon/build \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DBUILD_POSTGRESQL=ON \
        -DBUILD_EXAMPLES=OFF -DBUILD_CTL=OFF -DBUILD_TESTING=OFF \
    && cmake --build /tmp/drogon/build --parallel "$(nproc)" \
    && cmake --install /tmp/drogon/build \
    && rm -rf /tmp/drogon

# Install libpqxx
ARG LIBPQXX_VERSION=7.9.2
RUN git clone --depth 1 --branch ${LIBPQXX_VERSION} https://github.com/jtv/libpqxx.git /tmp/libpqxx \
    && cmake -S /tmp/libpqxx -B /tmp/libpqxx/build \
        -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DSKIP_BUILD_TEST=ON \
    && cmake --build /tmp/libpqxx/build --parallel "$(nproc)" \
    && cmake --install /tmp/libpqxx/build \
    && rm -rf /tmp/libpqxx

# Your backend/ contents
WORKDIR /src
COPY CMakeLists.txt ./
COPY src/ ./src/
COPY include/ ./include/
# COPY config.json ./           # if you have one

RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --parallel "$(nproc)"
# → /src/build/my_app

# ============================================================
# Stage 2 — RUNTIME
# ============================================================
FROM ubuntu:24.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# Runtime .so counterparts of the -dev packages above
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjsoncpp25 libuuid1 zlib1g libssl3t64 libc-ares2 libbrotli1 \
        libpq5 libpqxx-7.8t64 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --system --create-home --shell /usr/sbin/nologin appuser
WORKDIR /app

COPY --from=builder /src/build/my_app /app/my_app
RUN mkdir -p /app/uploads/tmp && chown -R appuser:appuser /app/uploads
USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/my_app"]