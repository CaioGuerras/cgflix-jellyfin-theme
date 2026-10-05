#!/bin/sh
# Copy Moonfin Web from the Moonbase plugin folder to the nginx box and pre-compress it.
# Usage: moonfin-sync.sh /path/to/jellyfin/data/plugins/Moonbase_X.Y.Z.W/frontend user@nginx-host [/var/www/moonfin-web]
# Run it again after every Moonbase update. GPL-2.0-or-later.
set -eu
SRC=$1; HOST=$2; DEST=${3:-/var/www/moonfin-web}
VER=$(sed -n 's/.*"version":"\([^"]*\)".*/\1/p' "$SRC/version.json")
rsync -a --delete --exclude '*.gz' "$SRC/" "$HOST:$DEST/$VER/Moonfin/Web/"
ssh "$HOST" "cd $DEST/$VER/Moonfin/Web && find . -type f -size +1k \( -name '*.wasm' -o -name '*.js' -o -name '*.mjs' -o -name '*.json' \
  -o -name '*.ttf' -o -name '*.otf' -o -name '*.svg' -o -name '*.css' -o -name '*.bin' \) -exec gzip -9 -k -f {} + && \
  chmod -R a+rX $DEST && ln -sfn $DEST/$VER $DEST/current && ls -la main.dart.wasm*"
