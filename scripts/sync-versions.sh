#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

source ./common.sh

detect_commands "jq"

updated_pkg_names=()
main_pkg_json="$(read_pkg_json)"
main_pkg_version=$(jq -r -e ".version" <<< "$main_pkg_json")

print_info "Main package version: ${main_pkg_version}"

for pkg_dir in "$ROOT_DIR"/packages/*; do
  pkg_json="$(read_pkg_json "$pkg_dir")"
  pkg_private=$(jq ".private // false" <<< "$pkg_json")
  pkg_name=$(jq -e ".name" <<< "$pkg_json")
  pkg_version=$(jq -r -e ".version" <<< "$pkg_json")

  if [ "$pkg_private" != "false" ]; then
    print_info "Skipping private package: ${pkg_name}"
    continue
  fi

  if [ "$pkg_version" == "$main_pkg_version" ]; then
    print_info "Package ${pkg_name} already has the correct version: skipping"
    continue
  fi

  write_pkg_json "$pkg_dir" "$(jq --arg v "$main_pkg_version" '.version = $v' <<< "$pkg_json")"

  print_ok "Updated version for package: ${pkg_name}"
  updated_pkg_names+=("$pkg_name")
done

if [ ${#updated_pkg_names[@]} -eq 0 ]; then
  exit 0
fi
