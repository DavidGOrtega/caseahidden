#!/bin/bash

set -e

## SKIP IF COMMIT FILTER
COMMIT_FILTER="dvc repro"

# Check skip ci
readonly local last_commit_log=$(git log -1 --pretty=format:"%s")
echo "Last commit log: $last_commit_log"

readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
echo "Number of occurences of '$COMMIT_FILTER' in '$last_commit_log': $filter_count"

if ! [[ "$filter_count" -eq 0 ]]; then
  echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", stopping"
  exit 0 # exit 78
fi

{ # try

    echo Pulling from dvc repo... && \
    dvc pull && \
    echo DVC repro ${dvc_file} && \
    dvc repro ${dvc_file} && \
    dvc push && \
    echo "done!" && \

} || { # catch
    git reset
    exit 1
}

