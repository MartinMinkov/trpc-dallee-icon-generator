# This script is used for debugging purposes. It will launch a postgres container and import a sql dump into it.

#!/usr/bin/env bash
set -x
set -eo pipefail

# Check if a custom user has been set, otherwise default to 'postgres'
DB_USER="${POSTGRES_USER:=postgres}"
# Check if a custom password has been set, otherwise default to 'password'
DB_PASSWORD="${POSTGRES_PASSWORD:=password}"
# Check if a custom database name has been set, otherwise default to 'archive'
DB_NAME="${POSTGRES_DB:=icon_generator_db}"
# Check if a custom port has been set, otherwise default to '5432'
DB_PORT="${POSTGRES_PORT:=5432}"
# Check if a custom host has been set, otherwise default to 'localhost'
DB_HOST="${POSTGRES_HOST:=localhost}"

CONTAINER_NAME="icon_generator_db_$(date '+%s')"

# if a postgres container is running, print instructions to kill it and exit
RUNNING_POSTGRES_CONTAINER=$(docker ps --filter name=$(CONTAINER_NAME) --format '{{.ID}}')
if [[ -n $RUNNING_POSTGRES_CONTAINER ]]; then
  echo >&2 "there is a postgres container already running, kill it with"
  echo >&2 "    docker kill ${RUNNING_POSTGRES_CONTAINER}"
  docker kill ${RUNNING_POSTGRES_CONTAINER}
fi
# Launch postgres using Docker
docker run \
    -e POSTGRES_USER=${DB_USER} \
    -e POSTGRES_PASSWORD=${DB_PASSWORD} \
    -e POSTGRES_DB=${DB_NAME} \
    -p "${DB_PORT}":5432 \
    -d \
    --name ${CONTAINER_NAME} \
    postgres -N 1000
    # ^ Increased maximum number of connections for testing purposes

# Keep pinging Postgres until it's ready to accept commands
until PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -p "${DB_PORT}" -d "postgres" -c '\q'; do
  >&2 echo "Postgres is still unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up and running on port ${DB_PORT}!"

# Export the connection string as an environment variable
export DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}
echo DATABASE_URL
>&2 echo "Postgres has been initalized and is ready to go!"

npx prisma db push
>&2 echo "Database schema has been pushed to the database"