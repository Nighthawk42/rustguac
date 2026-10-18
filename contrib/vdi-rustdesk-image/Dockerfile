FROM debian:bookworm-slim

ARG RUSTDESK_VERSION=1.4.9
ARG RUSTDESK_SHA256=7244ba47c40e804172044bfbe659467c54ce46554c98e78c8c0406f1d612fda3

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl dbus-user-session dbus-x11 \
    xrdp xorgxrdp xserver-xorg xfce4 xfce4-terminal \
    libgtk-3-0 libxdo3 libxfixes3 libxrandr2 libxtst6 \
    libasound2 libpulse0 libva2 libvdpau1 libpam0g libssl3 \
    libayatana-appindicator3-1 libappindicator3-1 \
    pipewire pipewire-pulse wireplumber \
    && curl -fsSL -o /tmp/rustdesk.deb \
       "https://github.com/rustdesk/rustdesk/releases/download/${RUSTDESK_VERSION}/rustdesk-${RUSTDESK_VERSION}-x86_64.deb" \
    && echo "${RUSTDESK_SHA256}  /tmp/rustdesk.deb" | sha256sum -c - \
    && apt-get install -y --no-install-recommends /tmp/rustdesk.deb \
    && rm -f /tmp/rustdesk.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /opt/entrypoint.sh
COPY start-rustdesk.sh /usr/local/bin/start-rustdesk
RUN chmod 755 /opt/entrypoint.sh /usr/local/bin/start-rustdesk \
    && sed -i -e 's/^new_cursors=.*/new_cursors=true/' \
              -e 's/^crypt_level=.*/crypt_level=high/' /etc/xrdp/xrdp.ini

EXPOSE 3389
ENTRYPOINT ["/opt/entrypoint.sh"]
