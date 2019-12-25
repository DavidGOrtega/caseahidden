#!/bin/bash

set -e

dvc_file=${dvc_file:-Dvcfile}
echo Pulling from dvc repo...
dvc pull

echo Runnig dvc repro ${dvc_file}
dvc repro ${dvc_file}

if ! git diff-index --quiet HEAD --; then
    echo Pushing to repo
    
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    git commit -m "${COMMIT_FILTER}; Leave me to ci skip!" -a
    git remote add github "https://$GITHUB_ACTOR:$github_token@github.com/$GITHUB_REPOSITORY.git"
    git push github HEAD:${GITHUB_REF}

    if [ "${dvc_push:-true}" = true ] ; then
        echo Pushing to dvc repo
        dvc push
    fi
fi
