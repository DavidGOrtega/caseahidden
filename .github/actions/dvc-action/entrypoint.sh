#!/bin/bash

set -e

COMMIT_FILTER="dvc repro"
remote_repo="https://${GITHUB_ACTOR}:${github_token}@github.com/$GITHUB_REPOSITORY.git"
branch=${INPUT_BRANCH:-master}
dvc_file=${dvc_file:-Dvcfile}

# Skip if commit filter
readonly local last_commit_log=$(git log -1 --pretty=format:"%s")
readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
if ! [[ "$filter_count" -eq 0 ]]; then
  echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", stopping"
  exit 0 # exit 78 # 78 is neutral github code 
fi

echo Pulling from dvc repo...
dvc pull

echo Runnig dvc repro ${dvc_file}
dvc repro ${dvc_file}

if ! git diff-index --quiet HEAD --; then
    echo Pushing to repo
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git commit -m "${COMMIT_FILTER}" -a
    git push "${remote_repo}" HEAD:${branch}

    echo Pushing to dvc repo
    #dvc push
fi

