#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

source ./common.sh

detect_commands "bun" "npm"

if output=$(bun whoami 2>&1); then
  print_info "Logged as ${output}"
else
  npm login
fi

for pkg_dir in "$ROOT_DIR"/packages/*; do
  pkg_json="$(read_pkg_json "$pkg_dir")"
  pkg_private=$(jq ".private // false" <<< "$pkg_json")
  pkg_name=$(jq -e ".name" <<< "$pkg_json")

  if [ "$pkg_private" != "false" ]; then
    print_info "Skipping private package: ${pkg_name}"
    continue
  fi

  bun publish --cwd "$pkg_dir"
done
