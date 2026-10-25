#!/usr/bin/env bash
# Alg0rithm installer — installs the NATIVE desktop app only (Tauri).
# Never opens a browser / website.
set -euo pipefail

YES=0
OWNER="hammuod"
REPO="Alg0rithm"
APP_NAME="alg0rithm"
GH_API="https://api.github.com/repos/${OWNER}/${REPO}/releases/latest"
WORK="${TMPDIR:-/tmp}/alg0rithm-install-$$"
SUDO=()
PKG_MANAGER=""

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS]

Install the native Alg0rithm desktop app (Tauri window — not a website).

Options:
  -y, --yes     Non-interactive
  -h, --help    Help

  curl -fsSL https://api.alg0rithm.dev/install.sh | bash
  curl -fsSL https://api.alg0rithm.dev/install.sh | bash -s -- -y
EOF
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }
info()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m[ OK ]\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
err()   { printf '\033[1;31m[ERR ]\033[0m %s\n' "$*" >&2; }

cleanup() { rm -rf "${WORK}" 2>/dev/null || true; }
trap cleanup EXIT

require_sudo() {
  if [[ "${EUID}" -eq 0 ]]; then SUDO=(); return; fi
  if ! has_cmd sudo; then
    err "Need root (sudo) to install system packages."
    exit 1
  fi
  SUDO=(sudo)
}

ask_yes() {
  local q="$1"
  if [[ "${YES}" -eq 1 ]]; then return 0; fi
  if [[ ! -r /dev/tty ]]; then err "No TTY — use -y"; exit 1; fi
  printf '%s [Y/n]: ' "${q}" >/dev/tty
  local a; read -r a </dev/tty || true
  case "${a}" in ''|y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}

run() {
  local desc="$1"; shift
  echo
  info "${desc}"
  printf '  $ %s\n' "$*"
  if [[ "${YES}" -eq 0 ]] && ! ask_yes "Run this command?"; then
    err "Aborted."; exit 1
  fi
  "$@"
}

detect_pm() {
  if has_cmd apt-get; then PKG_MANAGER=apt
  elif has_cmd dnf; then PKG_MANAGER=dnf
  elif has_cmd yum; then PKG_MANAGER=yum
  elif has_cmd zypper; then PKG_MANAGER=zypper
  elif has_cmd pacman; then PKG_MANAGER=pacman
  elif has_cmd apk; then PKG_MANAGER=apk
  else PKG_MANAGER=generic
  fi
}

detect_system() {
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
  else NAME=Unknown; ID=unknown; fi
  detect_pm
  info "System: ${NAME:-?} (${ID:-?}) · package manager: ${PKG_MANAGER}"
}

ensure_tools() {
  local need=()
  has_cmd curl || need+=(curl)
  [[ ${#need[@]} -eq 0 ]] && return
  require_sudo
  case "${PKG_MANAGER}" in
    apt) run "Install curl" "${SUDO[@]}" apt-get install -y curl ;;
    dnf) run "Install curl" "${SUDO[@]}" dnf install -y curl ;;
    yum) run "Install curl" "${SUDO[@]}" yum install -y curl ;;
    zypper) run "Install curl" "${SUDO[@]}" zypper install -y curl ;;
    apk) run "Install curl" "${SUDO[@]}" apk add curl ;;
    pacman) run "Install curl" "${SUDO[@]}" pacman -Sy --noconfirm curl ;;
    *) err "Install curl, then retry."; exit 1 ;;
  esac
}

# Prefer real native packages only (Tauri). Never "website launcher".
list_release_assets() {
  # prints: name|url per line
  local json
  json="$(curl -fsSL -H 'User-Agent: alg0rithm-install' -H 'Accept: application/vnd.github+json' "${GH_API}")" || return 1
  # portable parse without jq
  echo "${json}" | tr '{' '\n' | while read -r chunk; do
    name="$(echo "${chunk}" | sed -n 's/.*"name": *"\([^"]*\)".*/\1/p' | head -1)"
    url="$(echo "${chunk}" | sed -n 's/.*"browser_download_url": *"\([^"]*\)".*/\1/p' | head -1)"
    if [[ -n "${name}" && -n "${url}" && "${name}" != *.sha256 ]]; then
      printf '%s|%s\n' "${name}" "${url}"
    fi
  done
}

pick_asset() {
  local assets lines name url
  assets="$(list_release_assets)" || return 1
  [[ -z "${assets}" ]] && return 1

  # Priority by package manager
  case "${PKG_MANAGER}" in
    apt)
      # Tauri deb often named like Alg0rithm_x.y.z_amd64.deb
      echo "${assets}" | grep -iE '\.deb$' | head -1 && return 0
      echo "${assets}" | grep -iE 'AppImage' | head -1 && return 0
      ;;
    dnf|yum|zypper)
      echo "${assets}" | grep -iE '\.rpm$' | head -1 && return 0
      echo "${assets}" | grep -iE 'AppImage' | head -1 && return 0
      ;;
    *)
      echo "${assets}" | grep -iE 'AppImage' | head -1 && return 0
      echo "${assets}" | grep -iE 'linux-bin|alg0rithm$' | head -1 && return 0
      ;;
  esac

  # Last resort: AppImage anywhere
  echo "${assets}" | grep -iE 'AppImage|\.deb$' | head -1
}

download() {
  local pair name url dest
  info "Looking up native package from GitHub Releases…"
  if ! pair="$(pick_asset)"; then
    err "No native package in the latest release yet."
    err "Build first: https://api.alg0rithm.dev/build?platform=deb"
    err "Or:        https://api.alg0rithm.dev/build?platform=appimage"
    err "Releases:  https://github.com/${OWNER}/${REPO}/releases"
    exit 1
  fi
  name="${pair%%|*}"
  url="${pair#*|}"
  mkdir -p "${WORK}"
  dest="${WORK}/${name}"
  info "Downloading native package: ${name}"
  curl -fsSL -L -o "${dest}" "${url}"
  printf '%s\n' "${dest}"
}

install_deb() {
  local pkg="$1"
  require_sudo
  run "Install native .deb (Tauri app)" "${SUDO[@]}" dpkg -i "${pkg}" \
    || run "Fix dependencies" "${SUDO[@]}" apt-get install -f -y
}

install_rpm() {
  local pkg="$1"
  require_sudo
  case "${PKG_MANAGER}" in
    dnf) run "Install native .rpm" "${SUDO[@]}" dnf install -y "${pkg}" ;;
    yum) run "Install native .rpm" "${SUDO[@]}" yum install -y "${pkg}" ;;
    zypper) run "Install native .rpm" "${SUDO[@]}" zypper install -y "${pkg}" ;;
  esac
}

install_appimage() {
  local pkg="$1"
  local bin="${XDG_BIN_HOME:-$HOME/.local/bin}"
  local apps="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
  local share="${XDG_DATA_HOME:-$HOME/.local/share}/alg0rithm"
  mkdir -p "${bin}" "${apps}" "${share}"
  local target="${share}/Alg0rithm.AppImage"
  cp "${pkg}" "${target}"
  chmod +x "${target}"
  # wrapper runs the AppImage binary — NOT a browser
  cat > "${bin}/${APP_NAME}" << EOF
#!/usr/bin/env bash
exec "${target}" "\$@"
EOF
  chmod +x "${bin}/${APP_NAME}"
  cat > "${apps}/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Alg0rithm
Comment=Learn algorithms — native app
Exec=${bin}/${APP_NAME}
Icon=alg0rithm
Terminal=false
Categories=Education;Development;
StartupNotify=true
EOF
  ok "AppImage installed → ${target}"
  ok "Command: ${bin}/${APP_NAME}"
  if [[ ":$PATH:" != *":${bin}:"* ]]; then
    warn "Add to PATH: export PATH=\"${bin}:\$PATH\""
  fi
}

install_binary() {
  local pkg="$1"
  local bin="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "${bin}"
  cp "${pkg}" "${bin}/${APP_NAME}"
  chmod +x "${bin}/${APP_NAME}"
  ok "Binary installed → ${bin}/${APP_NAME}"
}

install_file() {
  local pkg="$1"
  case "${pkg}" in
    *.deb) install_deb "${pkg}" ;;
    *.rpm) install_rpm "${pkg}" ;;
    *.AppImage|*.appimage) install_appimage "${pkg}" ;;
    *)
      if file "${pkg}" 2>/dev/null | grep -qi 'executable\|ELF'; then
        install_binary "${pkg}"
      else
        err "Not a native package: ${pkg}"
        err "Rebuild Tauri packages, then re-run installer."
        exit 1
      fi
      ;;
  esac
}

main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -y|--yes) YES=1 ;;
      -h|--help) usage; exit 0 ;;
      *) usage >&2; exit 1 ;;
    esac
    shift
  done

  echo
  info "Alg0rithm native installer (Tauri — no browser)"
  detect_system
  ensure_tools

  local pkg
  pkg="$(download)"
  install_file "${pkg}"

  echo
  ok "Done. This is a real desktop window app."
  if has_cmd "${APP_NAME}"; then
    info "Start:  ${APP_NAME}"
  elif [[ -x "${XDG_BIN_HOME:-$HOME/.local/bin}/${APP_NAME}" ]]; then
    info "Start:  ${XDG_BIN_HOME:-$HOME/.local/bin}/${APP_NAME}"
  else
    info "Start from your app menu: Alg0rithm"
  fi
  info "Packages: https://github.com/${OWNER}/${REPO}/releases"
  echo
}

main "$@"
