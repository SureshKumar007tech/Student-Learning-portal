#!/bin/sh
set -eu

# Render provides PostgreSQL as a standard postgres:// URL. Convert it to the
# JDBC URL and credentials expected by Spring without writing credentials to logs.
if [ -n "${DATABASE_URL:-}" ]; then
  eval "$(python3 - <<'PY'
import os
import shlex
from urllib.parse import unquote, urlsplit

database_url = os.environ["DATABASE_URL"]
parsed = urlsplit(database_url)
if parsed.scheme not in ("postgres", "postgresql") or not parsed.hostname or not parsed.path:
    raise SystemExit("DATABASE_URL must be a valid PostgreSQL connection URL")

jdbc_url = f"jdbc:postgresql://{parsed.hostname}:{parsed.port or 5432}{parsed.path}?sslmode=require"
settings = {
    "SPRING_DATASOURCE_URL": jdbc_url,
    "SPRING_DATASOURCE_USERNAME": unquote(parsed.username or ""),
    "SPRING_DATASOURCE_PASSWORD": unquote(parsed.password or ""),
}
for key, value in settings.items():
    print(f"export {key}={shlex.quote(value)}")
PY
  )"
fi

exec java -XX:MaxRAMPercentage=75.0 -jar /app/app.jar
