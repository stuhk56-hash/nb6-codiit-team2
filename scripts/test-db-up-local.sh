#!/bin/sh
set -eu

DB_NAME="${TEST_DB_NAME:-codiit_test}"
DB_USER="${TEST_DB_USER:-test_user}"
DB_PORT="${TEST_DB_PORT:-5432}"

if ! command -v createuser >/dev/null 2>&1 || ! command -v createdb >/dev/null 2>&1; then
  echo "createuser/createdb command not found"
  exit 1
fi

createuser -s "$DB_USER" >/dev/null 2>&1 || true
createdb -U "$DB_USER" -p "$DB_PORT" "$DB_NAME" >/dev/null 2>&1 || true
