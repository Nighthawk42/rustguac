#!/bin/sh
set -eu

USERNAME="${VDI_USERNAME:-user}"
PASSWORD="${VDI_PASSWORD:-password}"
USER_HOME="/home/$USERNAME"

if ! id "$USERNAME" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "$USERNAME"
fi
echo "$USERNAME:$PASSWORD" | chpasswd

install -d -m 700 -o "$USERNAME" -g "$USERNAME" "$USER_HOME/.config/rustdesk"
cat > "$USER_HOME/.config/rustdesk/RustDesk2.toml" <<EOF
rendezvous_server = '${RUSTDESK_ID_SERVER:-rd.nighthawk.moe}'
nat_type = 1
serial = 0

[options]
custom-rendezvous-server = '${RUSTDESK_ID_SERVER:-rd.nighthawk.moe}'
relay-server = '${RUSTDESK_RELAY_SERVER:-rd.nighthawk.moe:21117}'
key = '${RUSTDESK_KEY:-Z6kn3tm6LGDc9++QtmYXrkymkAzgfcPKzpjOBOUPdJQ=}'
EOF
chown -R "$USERNAME:$USERNAME" "$USER_HOME/.config"

cat > "$USER_HOME/.xsession" <<'EOF'
export XDG_CURRENT_DESKTOP=XFCE
export XDG_SESSION_DESKTOP=xfce
export DESKTOP_SESSION=xfce
export XDG_SESSION_TYPE=x11
export GDK_BACKEND=x11
/usr/local/bin/start-rustdesk &
exec dbus-run-session -- startxfce4
EOF
chown "$USERNAME:$USERNAME" "$USER_HOME/.xsession"

sed -i \
    -e 's|^certificate=.*|certificate=/etc/ssl/certs/ssl-cert-snakeoil.pem|' \
    -e 's|^key_file=.*|key_file=/etc/ssl/private/ssl-cert-snakeoil.key|' \
    /etc/xrdp/xrdp.ini
chmod 644 /etc/ssl/private/ssl-cert-snakeoil.key 2>/dev/null || true

mkdir -p /run/dbus
dbus-daemon --system --fork 2>/dev/null || true
xrdp-sesman --nodaemon &
exec xrdp --nodaemon
