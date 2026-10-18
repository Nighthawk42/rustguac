#!/bin/sh
set -eu

# Wait until the xrdp X session and D-Bus session are ready.
sleep 2
while true; do
    rustdesk --no-server || true
    sleep 2
done
