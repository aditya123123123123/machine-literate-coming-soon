import { readdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const scriptPath = '/_vercel/insights/script.js';
const pages = readdirSync(new URL('../public/', import.meta.url), { recursive: true })
  .filter(path => path.endsWith('.html')).sort();

for (const path of pages) {
  test(`Web Analytics loads once on ${path}`, async ({ page, baseURL, context }) => {
    const analyticsRequests = [];
    const problems = [];
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/_vercel/insights/')) analyticsRequests.push(url.pathname);
      if (url.origin !== baseURL && url.protocol !== 'data:') problems.push(`external request: ${url}`);
    });
    page.on('response', response => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
    });
    page.on('console', message => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('pageerror', error => problems.push(error.message));

    await page.goto(`/${path}`, { waitUntil: 'networkidle' });
    const scripts = page.locator('script[src*="/_vercel/insights/"]');
    await expect(scripts).toHaveCount(1);
    await expect(scripts).toHaveAttribute('src', scriptPath);
    expect(await scripts.evaluate(script => script.defer)).toBe(true);
    expect(await page.evaluate(() => typeof window.va)).toBe('function');
    expect(analyticsRequests).toEqual([scriptPath]);
    expect(await context.cookies()).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test('local analytics script is a successful no-op, not a production tracker', async ({ request }) => {
  expect(pages.length).toBeGreaterThan(0);
  const response = await request.get(scriptPath);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/javascript');
  expect(await response.text()).toBe('// Web Analytics is disabled in local previews.\n');
  const missing = await request.get('/_vercel/insights/not-a-script.js');
  expect(missing.status()).toBe(404);
});
