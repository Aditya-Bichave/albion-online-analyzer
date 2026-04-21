#!/usr/bin/env bash
set -euo pipefail

# Jules environment setup for Albion Online Analyzer.
# Designed for the Ubuntu-based Jules VM:
# - keep installs minimal and idempotent
# - rely on preinstalled Node/Python when available
# - install only the native packages this repo actually needs
# - prepare both Node and Python environments for backend/frontend tooling

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf '\n[%s] %s\n' "jules-setup" "$*"
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

APT_PACKAGES=()

queue_apt_package() {
  local package="$1"
  if dpkg -s "$package" >/dev/null 2>&1; then
    return
  fi
  APT_PACKAGES+=("$package")
}

ensure_base_commands() {
  local missing=()

  for cmd in git python3 pip npm node; do
    if ! have_cmd "$cmd"; then
      missing+=("$cmd")
    fi
  done

  if ((${#missing[@]} > 0)); then
    log "Missing base commands: ${missing[*]}"
    if ! have_cmd apt-get; then
      echo "apt-get is not available, and required commands are missing: ${missing[*]}" >&2
      exit 1
    fi

    queue_apt_package git
    queue_apt_package python3
    queue_apt_package python3-pip
    queue_apt_package nodejs
    queue_apt_package npm
  fi
}

ensure_native_build_deps() {
  # backend/cap can require native build support and libpcap on Linux.
  queue_apt_package build-essential
  queue_apt_package pkg-config
  queue_apt_package libpcap-dev
  queue_apt_package python3-venv
}

install_apt_packages_if_needed() {
  if ! have_cmd apt-get; then
    if ((${#APT_PACKAGES[@]} > 0)); then
      echo "apt-get is unavailable but these packages are required: ${APT_PACKAGES[*]}" >&2
      exit 1
    fi
    return
  fi

  if ((${#APT_PACKAGES[@]} == 0)); then
    log "No additional apt packages required"
    return
  fi

  local apt_runner=()
  if have_cmd sudo; then
    apt_runner=(sudo)
  fi

  log "Installing apt packages: ${APT_PACKAGES[*]}"
  "${apt_runner[@]}" apt-get update -y
  "${apt_runner[@]}" apt-get install -y --no-install-recommends "${APT_PACKAGES[@]}"
}

show_versions() {
  log "Tool versions"
  python3 --version || true
  pip --version || true
  node --version || true
  npm --version || true
  git --version || true
}

prepare_env_file() {
  if [[ ! -f .env && -f .env.example ]]; then
    cp .env.example .env
    log "Created .env from .env.example"
  fi
}

setup_python_env() {
  if [[ ! -f requirements.txt ]]; then
    log "No requirements.txt found, skipping Python environment setup"
    return
  fi

  if [[ ! -d .venv ]]; then
    log "Creating Python virtual environment"
    python3 -m venv .venv
  fi

  # shellcheck disable=SC1091
  source .venv/bin/activate
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
  deactivate
}

install_node_dependencies() {
  local target_dir="$1"
  if [[ ! -f "$target_dir/package.json" ]]; then
    return
  fi

  log "Installing Node dependencies in $target_dir"
  if [[ -f "$target_dir/package-lock.json" ]]; then
    npm --prefix "$target_dir" ci
  else
    npm --prefix "$target_dir" install
  fi
}

prime_graphify_context() {
  if [[ -f graphify-out/GRAPH_REPORT.md ]]; then
    log "graphify-out already present; keeping committed graph context available for Jules"
    return
  fi

  log "graphify-out not present; skipping graph priming during setup"
}

main() {
  log "Starting Jules environment setup in $ROOT_DIR"

  ensure_base_commands
  ensure_native_build_deps
  install_apt_packages_if_needed
  show_versions

  prepare_env_file
  setup_python_env

  install_node_dependencies "."
  install_node_dependencies "backend"
  install_node_dependencies "frontend"

  prime_graphify_context

  log "Setup complete"
  log "Recommended validation commands:"
  echo "  node --check main.js"
  echo "  node --check backend/server.js"
  echo "  node --check backend/sniffer.js"
  echo "  npm --prefix frontend run build"
  echo "  npm --prefix frontend run lint"
}

main "$@"
