// #252: the admin table overran the page at 1710px wide and the page scrolled
// sideways. Each list page must fit its table inside the viewport at 1710px
// with nothing cut off, and the page must not scroll horizontally.
import { test, expect } from '@playwright/test';
import { installApi, settle, folder, entry } from '../lib/api.mjs';

test.use({ viewport: { width: 1710, height: 1112 } });

async function noHorizontalOverflow(page) {
    const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScroll: document.body.scrollWidth
    }));
    expect(m.scrollWidth, 'document must not be wider than the viewport').toBeLessThanOrEqual(m.clientWidth);
    expect(m.bodyScroll).toBeLessThanOrEqual(m.clientWidth);
}

async function tableFits(page, selector) {
    const table = page.locator(selector).first();
    await expect(table).toBeVisible();
    const box = await table.boundingBox();
    const vw = page.viewportSize().width;
    expect(box.x + box.width, `${selector} right edge must be inside the viewport`).toBeLessThanOrEqual(vw + 0.5);
}

test('connections: the entries table with admin actions fits at 1710px', async ({ page }) => {
    await installApi(page, { role: 'admin' });
    await page.goto('/connections.html');
    await settle(page);
    // Open the first tenant folder so the admin table (edit/clone/delete) renders.
    await page.locator('.folder-row').filter({ hasText: /beta/ }).first().click();
    await expect(page.locator('#entries-title')).toHaveText(/beta/);
    await expect(page.locator('.entries-table')).toBeVisible();
    await expect(page.locator('.entries-table tbody tr').first()).toBeVisible();
    await tableFits(page, '.entries-table');
    await noHorizontalOverflow(page);
});

test('recordings: the table fits at 1710px', async ({ page }) => {
    await installApi(page);
    await page.goto('/recordings.html');
    await settle(page);
    await expect(page.locator('#recording-list tbody tr').first()).toBeVisible();
    await tableFits(page, '#recording-list');
    await noHorizontalOverflow(page);
});

test('reports: the session history table fits at 1710px', async ({ page }) => {
    await installApi(page);
    await page.goto('/reports.html');
    await settle(page);
    await expect(page.locator('#history-body tr').first()).toBeVisible();
    await tableFits(page, '#history-table');
    await noHorizontalOverflow(page);
});

// The fixture above is short enough to fit even without #252's changes, so
// these use the data that actually overran the page: dotted FQDNs, service
// accounts, long emails and folder paths. None of them has a natural break
// point, so they are what the wrapping has to cope with at any font width.
const LONG_HOST = 'sqlclusternode03.prod.melbourne.acmeholdings.internal';
const LONG_USER = 'firstname.lastname@subsidiary.acmeholdings.com.au';

function wideFolder() {
    return folder('wide', {
        entries: [
            entry('sqlclusternode03', 'rdp', {
                hostname: LONG_HOST,
                username: 'svcbackupoperator',
                fields: { jump_hosts: [{ hostname: 'bastion01.dmz.acmeholdings.net' }] }
            }),
            entry('fileserverreplica02', 'ssh', {
                hostname: 'fileserverreplica02.dr.sydney.acmeholdings.internal',
                username: 'ansibleautomation'
            })
        ]
    });
}

test('connections: long hostnames and a jump host still fit at 1710px', async ({ page }) => {
    await installApi(page, { role: 'admin', folders: [wideFolder()] });
    await page.goto('/connections.html');
    await settle(page);
    await page.locator('.folder-row').filter({ hasText: /wide/ }).first().click();
    await expect(page.locator('.entries-table tbody tr').first()).toBeVisible();
    await tableFits(page, '.entries-table');
    // The last admin action must be on screen, not just the table box.
    const del = await page.locator('[data-delete-entry]').first().boundingBox();
    expect(del.x + del.width).toBeLessThanOrEqual(page.viewportSize().width);
    await noHorizontalOverflow(page);
});

test('recordings: long entry names, users and folders still fit at 1710px', async ({ page }) => {
    await installApi(page, {
        recordings: [{
            name: `rdp-${LONG_HOST}-20261011-020000.guac`, modified: '2026-10-11T02:30:00Z',
            size_bytes: 9_000_000, session_type: 'rdp', user: LONG_USER,
            folder: 'shared/customers/acmeholdings/production',
            address_book_entry: 'sqlclusternode03', entry_display_name: LONG_HOST
        }]
    });
    await page.goto('/recordings.html');
    await settle(page);
    await expect(page.locator('#recording-list tbody tr').first()).toBeVisible();
    await tableFits(page, '#recording-list');
    await noHorizontalOverflow(page);
});

test('reports: long hostnames and users still fit at 1710px', async ({ page }) => {
    await installApi(page, {
        routes: {
            'GET /api/reports/sessions': {
                total: 1, limit: 100, offset: 0,
                sessions: [{
                    session_id: '1', session_type: 'rdp', hostname: LONG_HOST, username: 'svcbackupoperator',
                    created_by: LONG_USER, status: 'Ended', started_at: '2026-10-11T02:00:00Z',
                    ended_at: '2026-10-11T02:30:00Z', duration_secs: 1800, entry_name: LONG_HOST
                }]
            }
        }
    });
    await page.goto('/reports.html');
    await settle(page);
    await expect(page.locator('#history-body tr').first()).toBeVisible();
    await tableFits(page, '#history-table');
    await noHorizontalOverflow(page);
});
