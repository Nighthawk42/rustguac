#!/bin/sh
set -eu

# Wait until the xrdp X session and D-Bus session are ready.
sleep 2
while true; do
    if [ -n "${RUSTDESK_TARGET_ID:-}" ]; then
        rustdesk --connect "$RUSTDESK_TARGET_ID" --no-server || true
    else
        rustdesk --no-server || true
    fi
    sleep 2
done
