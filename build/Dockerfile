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

# == PROD ==
FROM alpine:3.17.1

ARG USER=node
ENV HOME /home/$USER

RUN adduser -D $USER

RUN apk update && \
    apk add --no-cache \
    texmf-dist-latexextra \
    texlive-xetex \
    nodejs

USER $USER
WORKDIR $HOME

COPY --chown=$USER --from=build-env /app/dist         ./dist 
COPY --chown=$USER --from=build-env /app/assets       ./assets
COPY --chown=$USER --from=base      /app/node_modules ./node_modules

# place fonts & Rebuild fontchache
RUN mv ./assets/fonts ./.fonts && \
  fc-cache -fv

ENTRYPOINT ["/usr/bin/node"]
CMD ["dist/main.js"]
