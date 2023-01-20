# == BASE ==
FROM node:16 AS base
ENV CI=1
RUN npm i -g pnpm && \
    mkdir /app
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml /app/
RUN pnpm install --frozen-lockfile --prod

# == BUILD ==
FROM base AS build-env

# with dev dependencies
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# == PDFTEX ==
FROM ubuntu:bionic AS pdflatex-env
RUN apt update && apt install texlive-latex-base -y

# == PROD ==
FROM alpine:3.17.1

ARG USER=node
ENV HOME /home/$USER

RUN adduser -D $USER

RUN apk update && \
    apk add --no-cache \
    texmf-dist-latexextra \
    texlive \
    nodejs

USER $USER
WORKDIR $HOME

COPY --from=build-env /app/dist         ./dist 
COPY --from=build-env /app/assets       ./assets
COPY --from=base      /app/node_modules ./node_modules

ENTRYPOINT ["/usr/bin/node"]
CMD ["dist/main.js"]
