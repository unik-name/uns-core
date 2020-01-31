#!/usr/bin/env bash

PUBLISH_OPTS=$1

set -e

# Check new commits since 24h
if [ $(git log --since="1 day" | wc -l) -eq 0 ]; then
    echo "Nothing to publish since 1 day.";
    exit 0;
fi

if [[ -n "$CI" ]];then
    echo "Authenticate with registry."
    if [[ -z "$NPM_TOKEN" ]];then
        echo "Error: NPM_TOKEN is not set."
        exit 1
    fi

    set +x
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc
    set -x
fi

cd packages/crypto

actual_uns_version=$(grep '"uns_version":' package.json | cut -d\" -f4)
if [[ $actual_uns_version =~ "-" ]]; then
    echo "Version format is not X.Y.Z ($actual_uns_version)"
    exit 1
fi

echo "Bump package version..."
DATE=$(date -u +%Y%m%d%H%M%S)
new_version="${actual_uns_version}-dev.$DATE"
echo "New version: ${new_version}"

sed -i.bak "s/\"uns_version\": \"\(.*\)\"/\"uns_version\": \"$new_version\"/g" "./package.json"

echo
echo "Build and publish @uns/ark-crypto"
echo
npm publish --tag=dev $PUBLISH_OPTS

echo
echo "Build and publish @uns/core-nft-crypto"
echo
cd ../core-nft-crypto
npm publish --tag=dev $PUBLISH_OPTS

echo
echo "Build and publish @uns/uns-crypto"
echo
cd ../uns-crypto
npm publish --tag=dev $PUBLISH_OPTS

cd ../..

rm -f packages/core-nft-crypto/package.json.bak \
    packages/crypto/package.json.bak \
    packages/uns-crypto/package.json.bak
