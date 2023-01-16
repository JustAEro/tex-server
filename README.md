# $\LaTeX$ PDF-Generator Server

This is a simple single-endpoint-server that generates PDFs from $\LaTeX$ source code.

## Usage

POST your $\LaTeX$ source code to the server (endpoint `/`) and it will return a PDF.

## Setup

Posted content is enclosed in a LaTex document template.  
The Template is split into two parts: the pre-section and post-section.

Supply your template parts as files, located in `templates/doc_start.tex`
and `templates/doc_end.tex` respectively.  
This can be achieved by either mounting a volume to the container or building a new image.  
If you dont want to use a template, just leave the files empty.

Configure the port of the server by setting the environment variable `PORT` (default port is 3000).

## Customization

If you want to use special $\LaTeX$ packages, you have to modify the docker-image and install them.
See [here](https://pkgs.alpinelinux.org/packages?name=*texlive*) and [here](https://pkgs.alpinelinux.org/packages?name=*texmf*&branch=edge&repo=community&arch=x86_64&maintainer=) for available packages.
