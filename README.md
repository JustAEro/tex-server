# $\LaTeX$ PDF-Generator Server

This is a simple single-endpoint-server that generates PDFs from $\LaTeX$ source code.

## Usage

POST your $\LaTeX$ source code to the server (endpoint `/`) as `form-data` a and it will return a PDF.

## Setup

Posted content is included in a LaTex document template.  
Your `form-data` MUST include a `main.tex` file.

Supply your assets as files, located in [`./assets`](./assets) (e.g. images, fonts, etc.).
This can be achieved by either mounting a volume to the container or building a new image.

Configure the port of the server by setting the environment variable `PORT` (default port is 3000).

## Customization

If you want to use special $\LaTeX$ packages, you have to modify the docker-image and install them.
See [here](https://pkgs.alpinelinux.org/packages?name=*texlive*) and [here](https://pkgs.alpinelinux.org/packages?name=*texmf*&branch=edge&repo=community&arch=x86_64&maintainer=) for available packages.
