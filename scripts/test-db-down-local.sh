#!/bin/sh
set -eu

DB_NAME="${TEST_DB_NAME:-codiit_test}"
DB_USER="${TEST_DB_USER:-test_user}"
DB_PORT="${TEST_DB_PORT:-5432}"

if ! command -v dropdb >/dev/null 2>&1; then
  echo "dropdb command not found"
  exit 1
fi

dropdb -U "$DB_USER" -p "$DB_PORT" --if-exists "$DB_NAME"
