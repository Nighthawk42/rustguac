# RustDesk VDI image

This image provides the open-source RustDesk Linux client in an XFCE/xrdp
desktop for rustguac VDI sessions. It is preconfigured for the self-hosted
`rd.nighthawk.moe` rendezvous and relay servers. Operators enter a peer ID and
its password in the normal RustDesk window; rustguac does not store peer
credentials.

Build it with:

```bash
docker build -t rustguac-rustdesk:1.4.9 contrib/vdi-rustdesk-image
```

Create a `vdi` address-book entry whose `container_image` is
`rustguac-rustdesk:1.4.9`. The following optional container environment
variables override the baked-in server configuration:

- `RUSTDESK_ID_SERVER`
- `RUSTDESK_RELAY_SERVER`
- `RUSTDESK_KEY`
- `RUSTDESK_TARGET_ID` (open the connection window for this peer on login)

RustDesk is AGPL-3.0. Distributing an image containing its binary carries the
corresponding source-offer obligations. The source for the pinned package is
the `1.4.9` tag at <https://github.com/rustdesk/rustdesk>.
