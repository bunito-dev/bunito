ROOT_DIR="$(cd .. && pwd)"
PKG_JSON_FILE="package.json"

RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
CYAN=$(tput setaf 6)
RESET=$(tput sgr0)

print_color() {
  local message="${1}"
  local color="${2}"
  printf "%b%s%b" "$color" "$message" "$RESET"
}
print_ok() {
  print_log "OK" "$GREEN" "${1}"
}

print_info() {
  print_log "INFO" "$CYAN" "${1}"
}

print_warn() {
  print_log "WARN" "$YELLOW" "${1}"
}

print_error() {
  print_log "ERROR" "$RED" "${1}"
  exit 2
}

print_log() {
  local label="${1}"
  local color="${2}"
  local message="${3}"
  printf "$(print_color "[${label}]" "$color")\t%s\n" "$message" >&2
}

detect_commands() {
  local command
  for command in "$@"; do
    if ! command -v "$command" >/dev/null 2>&1; then
      print_error "Command '${command}' is required to run this script"
    fi
  done
}

read_pkg_json() {
  local pkg_dir="${1-"$ROOT_DIR"}"
  local pkg_json_path="${pkg_dir}/${PKG_JSON_FILE}"
  local pkg_json
  if [ ! -f "$pkg_json_path" ]; then
    print_error "${PKG_JSON_FILE} not found in directory: ${pkg_dir}"
  fi
  if ! pkg_json=$(jq -r '.' "$pkg_json_path" 2>/dev/null); then
    print_error "Invalid JSON in file: ${pkg_json_path}"
  fi
  printf "%s" "$pkg_json"
}

write_pkg_json() {
  local pkg_json_path="${1}/${PKG_JSON_FILE}"
  local pkg_json="$2"
  printf "%s" "$pkg_json" > "$pkg_json_path"
}
