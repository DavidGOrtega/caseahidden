#!/bin/bash

set -e
printenv

# COMMIT_FILTER="dvc repro"
# # Skip if commit filter
# readonly local last_commit_log=$(git log -1)
# readonly local filter_count=$(echo "$last_commit_log" | grep -c "$COMMIT_FILTER" )
# echo "Check skip last commit $last_commit_log"
# if ! [[ "$filter_count" -eq 0 ]]; then
#   echo "Last commit log \"$last_commit_log\" contains \"$COMMIT_FILTER\", skipping"
#   exit 0 # exit 78 # 78 is neutral github code 
# fi

# dvc_file=${dvc_file:-Dvcfile}
# echo Pulling from dvc repo...
# dvc pull

# echo Runnig dvc repro ${dvc_file}
# dvc repro ${dvc_file}

# if ! git diff-index --quiet HEAD --; then
#     echo Pushing to repo
    
#     git config --local user.email "action@github.com"
#     git config --local user.name "GitHub Action"
#     git commit -m "${COMMIT_FILTER}; Leave me to ci skip!" -a
#     git remote add github "https://$GITHUB_ACTOR:$github_token@github.com/$GITHUB_REPOSITORY.git"
#     git push github HEAD:${GITHUB_REF}

#     if [ "${dvc_push:-true}" = true ] ; then
#         echo Pushing to dvc repo
#         dvc push
#     fi
# fi

branch=$(echo ${GITHUB_REF#refs/heads/})
conclusion="success"
hash=$(echo git rev-parse HEAD)
hash2=$(echo git rev-parse HEAD~1)
data="[$hash,$hash2]"

echo $data
echo $dvc_endpoint

curl -d '{"repo":"'"$GITHUB_REPOSITORY"'", "head_branch":"'"$branch"'", "head_sha":"'"$GITHUB_SHA"'", "conclusion":"'"$conclusion"'", "data":"'"$data"'"}' -X POST $dvc_endpoint -H "Content-Type: application/json" 