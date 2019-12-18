#!/bin/bash

set -e
printenv

echo Pulling from dvc repo...
dvc pull
echo DVC repro ${dvc_file}
dvc repro ${dvc_file}

if ! git diff-index --quiet HEAD --; then
    echo dvc updated the repo, pushing...

    git add --all
    git commit -m "dvc repro [skip ci]"
    git push
    dvc push

    echo "done!"
fi