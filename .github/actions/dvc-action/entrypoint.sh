#!/bin/bash

set -e

## SKIP IF COMMIT FILTER
COMMIT_FILTER="dvc repro"

# Check skip ci
readonly local last_commit_log=$(git log -1 --pretty=format:"%s")
readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
if ! [[ "$filter_count" -eq 0 ]]; then
  echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", stopping"
  exit 0 # exit 78
fi

echo Pulling from dvc repo...
dvc pull

#dvc_file = ${dvc_file:-Dvcfile}
echo Runnig dvc repro ${dvc_file}
dvc repro ${dvc_file}

echo Pushing to dvc repo
#dvc push

if ! git diff-index --quiet HEAD --; then
    echo "Pushing"
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git commit -m "dvc repro" -a

    remote_repo="https://${GITHUB_ACTOR}:${github_token}@github.com/$GITHUB_REPOSITORY.git"
    git push "${remote_repo}" HEAD:master}
fi

echo "done!"
