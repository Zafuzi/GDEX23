#!/bin/bash

username=zafuzi
gameName=giving-a-sh-t

echo "removing old 'dist' ..."
rm -rf dist

echo "creating 'dist' ..."
mkdir -p dist

cp index.html dist
cp ./*.js dist
cp -rL scripts dist
cp -rL data dist

# butler push dist $username/$gameName:html5;