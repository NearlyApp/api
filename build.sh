#!/bin/bash

echo "@nearlyapp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=$NODE_AUTH_TOKEN
always-auth=true" > .npmrc

npm install --include=dev

npm run build
