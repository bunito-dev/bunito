#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

source ./common.sh

detect_commands "bun"

for pkg_dir in "$ROOT_DIR"/packages/*; do
  pkg_json="$(read_pkg_json "$pkg_dir")"
  pkg_private=$(jq ".private // false" <<< "$pkg_json")
  pkg_name=$(jq -e ".name" <<< "$pkg_json")
  pkg_version=$(jq -r -e ".version" <<< "$pkg_json")

  if [ "$pkg_private" != "false" ]; then
    print_info "Skipping private package: ${pkg_name}"
    continue
  fi

  if output=$(bun publish --cwd "$pkg_dir" --no-summary --silent --quiet --tolerate-republish 2>&1); then
    if echo "$output" | grep -qi "already"; then
      print_info "Package ${pkg_name}@${pkg_version} already published: skipping"
    else
      print_ok "Package ${pkg_name}@${pkg_version} published: skipping"
    fi
  else
    print_warn "Failed to publish ${pkg_name}@${pkg_version} package:"
    printf "%s" "$output"
  fi
done
