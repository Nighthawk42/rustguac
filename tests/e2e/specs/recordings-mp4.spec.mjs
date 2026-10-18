// #241: a recording can be downloaded as an MP4. The button starts a
// conversion on the server, shows its progress, and downloads the video as
// soon as it is ready, saved under the recording's name. Without MP4 support
// on the server (no `mp4` field in the listing) there is no button.
import { test, expect } from '@playwright/test';
import { installApi, settle, fixtureRecordings } from '../lib/api.mjs';

const NAME = 'rdp-dc01-20261011-020000.guac';
const MP4 = '/api/recordings/' + encodeURIComponent(NAME) + '/mp4';

test('mp4 converts, shows progress, then downloads', async ({ page }) => {
    let polls = 0;
    const recordings = fixtureRecordings().map(r => ({ ...r, mp4: 'none' }));
    const api = await installApi(page, {
        recordings,
        routes: {
            [`POST ${MP4}`]: { status: 202, contentType: 'application/json', body: '{"state":"running"}' },
            // Running for two polls, then ready.
            [`GET ${MP4}/status`]: () => (++polls < 3 ? { state: 'running' } : { state: 'ready', size_bytes: 5 }),
            [`GET ${MP4}`]: { status: 200, contentType: 'video/mp4', body: 'video' }
        }
    });
    await page.goto('/recordings.html');
    await settle(page);

    const btn = page.locator(`[data-mp4="${NAME}"]`);
    await expect(btn).toHaveText('mp4');
    const download = page.waitForEvent('download', { timeout: 15000 });
    await btn.click();
    await expect(page.locator(`[data-mp4="${NAME}"]`)).toHaveText(/converting/);
    const file = await download;
    expect(file.suggestedFilename()).toBe('rdp-dc01-20261011-020000.mp4');
    await expect(page.locator(`[data-mp4="${NAME}"]`)).toHaveText(/mp4 ↓/);
    expect(api.calls.filter(c => c.method === 'POST' && c.path === MP4)).toHaveLength(1);

    // Ready: a second click downloads straight away, with no new conversion.
    const again = page.waitForEvent('download');
    await page.locator(`[data-mp4="${NAME}"]`).click();
    await again;
    expect(api.calls.filter(c => c.method === 'POST' && c.path === MP4)).toHaveLength(1);
});

test('a live recording is refused with a message, and the button resets', async ({ page }) => {
    const recordings = fixtureRecordings().map(r => ({ ...r, mp4: 'none' }));
    await installApi(page, {
        recordings,
        routes: {
            [`POST ${MP4}`]: { status: 409, contentType: 'application/json',
                body: '{"error":"this session is still being recorded; try again once it has ended"}' }
        }
    });
    await page.goto('/recordings.html');
    await settle(page);
    await page.locator(`[data-mp4="${NAME}"]`).click();
    await expect(page.getByText('still being recorded')).toBeVisible();
    await expect(page.locator(`[data-mp4="${NAME}"]`)).toHaveText('mp4');
});

test('no mp4 button when the server cannot convert', async ({ page }) => {
    await installApi(page);
    await page.goto('/recordings.html');
    await settle(page);
    await expect(page.locator('#recording-list tbody tr').first()).toBeVisible();
    await expect(page.locator('[data-mp4]')).toHaveCount(0);
});
