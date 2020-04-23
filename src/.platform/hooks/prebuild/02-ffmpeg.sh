#!/bin/sh

wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz \
     --output-document=/tmp/ffmpeg.tar.xz
mkdir -p /tmp/ffmpeg
tar xvf /tmp/ffmpeg.tar.xz \
    --directory /tmp/ffmpeg \
    --strip-components 1
cp /tmp/ffmpeg/ffmpeg /usr/bin/
