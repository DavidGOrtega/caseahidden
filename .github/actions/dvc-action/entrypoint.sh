#!/bin/bash

set -e

printenv

COMMIT_FILTER="dvc repro"

# Skip if commit filter
# readonly local last_commit_log=$(git log -1 --pretty=format:"%s")
# readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
# if ! [[ "$filter_count" -eq 0 ]]; then
#   echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", skipping"
#   exit 0 # exit 78 # 78 is neutral github code 
# fi

dvc_file=${dvc_file:-Dvcfile}
echo Pulling from dvc repo...
dvc pull

echo Runnig dvc repro ${dvc_file}
dvc repro ${dvc_file}

if ! git diff-index --quiet HEAD --; then
    echo Pushing to repo
    
    # remote_repo="https://${GITHUB_ACTOR}:${github_token}@github.com/$GITHUB_REPOSITORY.git"
    # branch=${GITHUB_REF#refs/heads/}
    # git config --local user.email "action@github.com"
    # git config --local user.name "GitHub Action"
    # git commit -m "${COMMIT_FILTER}" -a
    # git push "${remote_repo}" HEAD:${branch}

    git remote add github "https://$GITHUB_ACTOR:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git"
    git pull github ${GITHUB_REF} --ff-only
    git commit -m "${COMMIT_FILTER}" -a
    git push github HEAD:${GITHUB_REF}

    echo Pushing to dvc repo
    #dvc push
fi

