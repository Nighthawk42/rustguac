#!/usr/bin/env node
/*
 * Pins how client.html leaves a session (#257).
 *
 * A fullscreen-on-connect session runs the client in a same-origin frame on
 * the Connections tab. Every other page refuses to load in a frame
 * (frame-ancestors 'none'), so a navigation from inside the frame (Home in
 * the Ctrl+Alt+Shift panel, reconnect, the disconnected overlay) that only
 * moved the frame showed the browser's "cannot open this page" in place of
 * the session. Every navigation must go through rgGo(), which moves the
 * whole tab when embedded.
 *
 * Usage: node tests/client-navigation.mjs
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(join(root, 'static/client.html'), 'utf8');

function lift(name) {
    const start = html.indexOf(`function ${name}(`);
    assert.notEqual(start, -1, `${name}() must exist in client.html`);
    let i = html.indexOf('{', start), depth = 0;
    for (; i < html.length; i++) {
        if (html[i] === '{') depth++;
        else if (html[i] === '}' && --depth === 0) break;
    }
    return { start, end: i + 1, src: html.slice(start, i + 1) };
}

const go = lift('rgGo');

// 1. Nothing navigates except through rgGo.
const outside = html.slice(0, go.start) + html.slice(go.end);
for (const pattern of [/location\.href\s*=/, /location\.replace\(/, /location\.assign\(/]) {
    assert.doesNotMatch(outside, pattern, `client.html must navigate through rgGo(), not ${pattern}`);
}

// 2. rgGo moves the whole tab when embedded, and only this page otherwise.
function run(embedded) {
    const top = { location: { href: '/client/x' } };
    const self = { location: { href: '/client/x' } };
    const ctx = { embedded, window: { top, location: self.location } };
    vm.createContext(ctx);
    vm.runInContext(go.src, ctx);
    ctx.rgGo('/connections.html');
    return { top: top.location.href, self: self.location.href };
}
let r = run(true);
assert.equal(r.top, '/connections.html', 'embedded: the whole tab goes');
assert.equal(r.self, '/client/x', 'embedded: the frame itself is not navigated');
r = run(false);
assert.equal(r.self, '/connections.html', 'a normal tab navigates itself');

console.log('client-navigation: ok');
