#!/bin/bash
# Fail unless every guacd protocol plugin rustguac uses was built.
#
# guacd's configure quietly leaves out a protocol whose library is missing,
# even when it is asked for with --with-<protocol>, so a build machine
# without libspice-client-glib-2.0-dev produced a guacd with no SPICE and
# nothing failed: SPICE and Proxmox consoles were missing from every .deb
# from v1.9.0 to v1.11.0. Run this after `make install` in every build path.
#
# Usage: check-guacd-plugins.sh <dir holding libguac-client-*.so>
set -euo pipefail

dir="${1:?usage: $0 <guacd lib dir>}"
missing=()
for protocol in rdp ssh vnc spice; do
    [[ -e "$dir/libguac-client-$protocol.so.0" ]] || missing+=("$protocol")
done
if (( ${#missing[@]} )); then
    echo "ERROR: guacd was built without: ${missing[*]} (looked in $dir)" >&2
    echo "Install the development library for each and rebuild; configure skips them silently." >&2
    exit 1
fi
echo "guacd plugins present: rdp ssh vnc spice"
