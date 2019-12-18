FROM ubuntu:18.04

RUN apt update
RUN apt -y install wget
RUN wget https://dvc.org/deb/dvc.list -O /etc/apt/sources.list.d/dvc.list
RUN apt update
RUN apt -y install dvc

LABEL "name"="DVC Action"
LABEL "maintainer"="Iterative.ai"
LABEL "version"="0.0.1"

LABEL "com.github.actions.name"="GitHub Action for DVC"
LABEL "com.github.actions.description"="Runs a DVC pipeline given a dvc file"
LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="orange"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
