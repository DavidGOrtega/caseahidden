#!/bin/bash

set -e

## SKIP IF COMMIT FILTER
COMMIT_FILTER="[skip ci]"

# Check skip ci
readonly local last_commit_log=$(git log -1 --pretty=format:"%s")
echo "Last commit log: $last_commit_log"

readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
echo "Number of occurences of '$COMMIT_FILTER' in '$last_commit_log': $filter_count"

if ! [[ "$filter_count" -eq 0 ]]; then
  echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", stopping"
  exit 78
fi

## SKIP IF COMMIT FILTER ENDS

echo Pulling from dvc repo...
dvc pull
echo DVC repro ${dvc_file}
dvc repro ${dvc_file}

if ! git diff-index --quiet HEAD --; then
    echo dvc updated the repo, pushing...

    git add --all
    git commit -m "dvc repro $COMMIT_FILTER"
    git push
    dvc push

    echo "done!"
fi