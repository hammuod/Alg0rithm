#!/usr/bin/env bash
# Alg0rithm installer — detects distro & package manager, installs the right package.
set -euo pipefail

YES=0
OWNER="hammuod"
REPO="Alg0rithm"
APP_NAME="alg0rithm"
WEB="https://alg0rithm.dev"
API_DL="https://api.alg0rithm.dev/dl"
GH_API="https://api.github.com/repos/${OWNER}/${REPO}/releases/latest"
TMPDIR="${TMPDIR:-/tmp}"
WORK="${TMPDIR}/alg0rithm-install-$$
"
SUDO=()
PKG_MANAGER=""

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS]

Install Alg0rithm for your Linux distribution.

Options:
  -y, --yes     Non-interactive (accept all)
  -h, --help    Show help

Examples:
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
  if [[ "${EUID}" -eq 0 ]]; then
    SUDO=()
    return
  fi
  if ! has_cmd sudo; then
    err "Need root. Install sudo or run as root."
    exit 1
  fi
  SUDO=(sudo)
  if [[ "${YES}" -eq 0 ]]; then
    info "Some steps need administrator privileges (sudo)."
  fi
}

ask_yes() {
  local q="$1"
  if [[ "${YES}" -eq 1 ]]; then return 0; fi
  if [[ ! -r /dev/tty ]]; then
    err "No TTY. Re-run with -y"
    exit 1
  fi
  printf '%s [Y/n]: ' "${q}" >/dev/tty
  local a
  read -r a </dev/tty || true
  case "${a}" in
    ''|y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

run() {
  local desc="$1"
  shift
  echo
  info "${desc}"
  printf '  $ %s\n' "$*"
  if [[ "${YES}" -eq 0 ]]; then
    if ! ask_yes "Run this command?"; then
      err "Aborted."
      exit 1
    fi
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
  else
    NAME="Unknown"
    ID="unknown"
  fi
  detect_pm
  info "System: ${NAME:-?} (${ID:-?}) · package manager: ${PKG_MANAGER}"
}

ensure_tools() {
  local need=()
  has_cmd curl || need+=(curl)
  has_cmd file || need+=(file)
  if [[ ${#need[@]} -eq 0 ]]; then return; fi
  require_sudo
  case "${PKG_MANAGER}" in
    apt) run "Install prerequisites" "${SUDO[@]}" apt-get install -y "${need[@]}" ;;
    dnf) run "Install prerequisites" "${SUDO[@]}" dnf install -y "${need[@]}" ;;
    yum) run "Install prerequisites" "${SUDO[@]}" yum install -y "${need[@]}" ;;
    zypper) run "Install prerequisites" "${SUDO[@]}" zypper install -y "${need[@]}" ;;
    apk) run "Install prerequisites" "${SUDO[@]}" apk add "${need[@]}" ;;
    pacman) run "Install prerequisites" "${SUDO[@]}" pacman -Sy --noconfirm "${need[@]}" ;;
    *) err "Missing: ${need[*]}. Install them and retry."; exit 1 ;;
  esac
}

# Pick best asset name pattern for this PM
asset_patterns() {
  case "${PKG_MANAGER}" in
    apt)    echo '\.deb$' ;;
    dnf|yum|zypper) echo '\.rpm$' ;;
    pacman) echo 'arch|pkg\.tar' ;;
    apk)    echo 'alpine' ;;
    *)      echo 'linux-any|tarball|\.tar\.gz$' ;;
  esac
}

fetch_release_json() {
  curl -fsSL -H 'User-Agent: alg0rithm-install' -H 'Accept: application/vnd.github+json' "${GH_API}"
}

pick_asset_url() {
  local json patterns name url
  json="$(fetch_release_json)" || return 1
  patterns="$(asset_patterns)"
  # Prefer matching package; skip .sha256
  while IFS= read -r line; do
    name="${line%%|*}"
    url="${line#*|}"
    [[ "${name}" == *.sha256 ]] && continue
    if echo "${name}" | grep -Eiq "${patterns}"; then
      printf '%s\n' "${url}|${name}"
      return 0
    fi
  done < <(echo "${json}" | grep -oE '"name": "[^"]+"|"browser_download_url": "[^"]+"' | \
    paste - - | sed 's/.*"name": "\([^"]*\)".*"browser_download_url": "\([^"]*\)".*/\1|\2/' | sed 's/|/|/')

  # fallback: any non-sha asset via python/node-free jq-less parse
  local fallback
  fallback="$(echo "${json}" | tr ',' '\n' | grep browser_download_url | head -1 | sed 's/.*"browser_download_url": *"//;s/".*//')"
  if [[ -n "${fallback}" ]]; then
    printf '%s\n' "${fallback}|package"
    return 0
  fi
  return 1
}

download_package() {
  mkdir -p "${WORK}"
  local pair url name dest
  info "Looking up latest release asset…"
  if ! pair="$(pick_asset_url)"; then
    warn "No GitHub release asset yet. Installing lightweight launcher only."
    install_launcher_only
    exit 0
  fi
  url="${pair%%|*}"
  name="${pair#*|}"
  dest="${WORK}/${name}"
  info "Downloading: ${name}"
  curl -fsSL -o "${dest}" -L "${url}" \
    || curl -fsSL -o "${dest}" -L "${API_DL}?platform=${PKG_MANAGER}" \
    || { err "Download failed."; exit 1; }
  printf '%s\n' "${dest}"
}

install_deb() {
  local pkg="$1"
  require_sudo
  run "Install DEB package" "${SUDO[@]}" dpkg -i "${pkg}" \
    || run "Fix dependencies" "${SUDO[@]}" apt-get install -f -y
}

install_rpm() {
  local pkg="$1"
  require_sudo
  case "${PKG_MANAGER}" in
    dnf) run "Install RPM" "${SUDO[@]}" dnf install -y "${pkg}" ;;
    yum) run "Install RPM" "${SUDO[@]}" yum install -y "${pkg}" ;;
    zypper) run "Install RPM" "${SUDO[@]}" zypper install -y "${pkg}" ;;
  esac
}

install_tarball() {
  local pkg="$1"
  local dest="${XDG_DATA_HOME:-$HOME/.local/share}/alg0rithm"
  local bin="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "${dest}" "${bin}"
  info "Extracting to ${dest}"
  tar -xzf "${pkg}" -C "${dest}" --strip-components=1 2>/dev/null \
    || tar -xzf "${pkg}" -C "${dest}"
  cat > "${bin}/${APP_NAME}" << EOF
#!/usr/bin/env bash
DIR="${dest}"
if [[ -f "\$DIR/app/index.html" ]]; then
  exec xdg-open "\$DIR/app/index.html"
elif [[ -f "\$DIR/bin/alg0rithm" ]]; then
  exec "\$DIR/bin/alg0rithm"
fi
exec xdg-open "${WEB}"
EOF
  chmod +x "${bin}/${APP_NAME}"
  ok "Launcher: ${bin}/${APP_NAME}"
  if [[ ":$PATH:" != *":${bin}:"* ]]; then
    warn "Add to PATH: export PATH=\"${bin}:\$PATH\""
  fi
}

install_launcher_only() {
  local bin="${XDG_BIN_HOME:-$HOME/.local/bin}"
  local apps="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
  mkdir -p "${bin}" "${apps}"
  cat > "${bin}/${APP_NAME}" << EOF
#!/usr/bin/env bash
exec xdg-open "${WEB}" 2>/dev/null || echo "${WEB}"
EOF
  chmod +x "${bin}/${APP_NAME}"
  cat > "${apps}/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Alg0rithm
Comment=Learn algorithms simply
Exec=${bin}/${APP_NAME}
Icon=alg0rithm
Terminal=false
Categories=Education;Development;
StartupNotify=true
EOF
  ok "Launcher installed: ${bin}/${APP_NAME}"
  ok "Desktop entry: ${apps}/${APP_NAME}.desktop"
  if [[ ":$PATH:" != *":${bin}:"* ]]; then
    warn "Add to PATH: export PATH=\"${bin}:\$PATH\"  (or re-login)"
  fi
}

install_package_file() {
  local pkg="$1"
  case "${pkg}" in
    *.deb) install_deb "${pkg}" ;;
    *.rpm) install_rpm "${pkg}" ;;
    *.tar.gz|*.tgz) install_tarball "${pkg}" ;;
    *)
      warn "Unknown package type: ${pkg}"
      install_launcher_only
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
  info "Alg0rithm installer"
  detect_system
  ensure_tools

  local pkg
  pkg="$(download_package)"
  if [[ -n "${pkg}" && -f "${pkg}" ]]; then
    install_package_file "${pkg}"
  fi

  # Desktop entry for system installs too
  if has_cmd "${APP_NAME}" || [[ -x "${XDG_BIN_HOME:-$HOME/.local/bin}/${APP_NAME}" ]]; then
    :
  else
    install_launcher_only
  fi

  echo
  ok "Installation finished."
  info "Run:  ${APP_NAME}"
  info "Or open: ${WEB}"
  info "Releases: https://github.com/${OWNER}/${REPO}/releases"
  echo
}

main "$@"
