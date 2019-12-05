#!/usr/bin/env bash
. "$1/../../scripts/utils.sh"

uns_name=$(retrieve_uns_name "$1/../crypto/package.json")
if [ -z "$uns_name" ]
then
    echo "Unable to retrieve uns package name"
    exit 1
fi

echo "Remapping @arkecosystem/crypto to @uns/$uns_name"

#backup package.json
cp "$1/package.json" "$1/package.json.back"

package_name=$(basename $1)
case $package_name in
    uns-crypto|core-nft-crypto)
        #replace @arkecosystem/crypto by @uns/$uns_name in all .d.ts and .js of dist/
        find dist \( -name "*.js" -o -name "*.d.ts" \) -exec sed -i "s/@arkecosystem\/crypto/@uns\/$uns_name/g" {} +
        #get @uns/ark-crypto version
        uns_version=$(retrieve_uns_version "$1/../crypto/package.json")
        if [ -n "$uns_version" ]
        then
            echo "Set @uns/$uns_name dependency to version $uns_version"
            sed -i "s/\"@arkecosystem\/crypto\": \".*\"/\"@uns\/$uns_name\": \"\^$uns_version\"/g" "$1/package.json"
        else
            echo "Unable to retrieve @uns/$uns_name version"
            exit 1
        fi;;
    *)
        echo "Unknown UNS package $package_name"
        exit 1;;
esac
