import { test, expect } from '@playwright/test';

test.describe('Landing Video & Home Video Lifecycle', () => {
  test('Home video stays at 0:00 while landing video is playing, starts from 0:00 when landing is done, and landing is skipped on reload', async ({ page }) => {
    // Ensure clean session storage for initial arrival test
    await page.addInitScript(() => {
      window.sessionStorage.clear();
    });

    // 1. Initial Visit
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const landingOverlay = page.locator('#landing-video-overlay');
    await expect(landingOverlay).toBeVisible({ timeout: 15000 });

    // 2. While landing video is playing, check home banner video status
    await page.waitForTimeout(1000);
    const duringLandingStatus = await page.evaluate(() => {
      const vid = document.querySelector('video source[src="/videos/home-banner.mp4"]')?.parentElement as HTMLVideoElement;
      return vid ? { currentTime: vid.currentTime, paused: vid.paused } : null;
    });

    console.log('Home video status DURING landing playback:', duringLandingStatus);
    expect(duringLandingStatus).not.toBeNull();
    // Home video must NOT be playing while landing is active
    expect(duringLandingStatus!.currentTime).toBe(0);
    expect(duringLandingStatus!.paused).toBe(true);

    // 3. Complete landing video
    await page.evaluate(() => {
      const vid = document.querySelector('video[src="/videos/landing.mp4"]') as HTMLVideoElement;
      if (vid) {
        if (Number.isFinite(vid.duration) && vid.duration > 0) {
          vid.currentTime = vid.duration;
        } else {
          vid.dispatchEvent(new Event('ended'));
        }
      }
    });

    // Wait for landing video to finish (onEnded) and AnimatePresence exit transition to complete
    await page.waitForTimeout(1200);
    await expect(landingOverlay).not.toBeVisible();

    // 4. Check home banner video status immediately after opening
    const afterOpeningStatus = await page.evaluate(() => {
      const vid = document.querySelector('video source[src="/videos/home-banner.mp4"]')?.parentElement as HTMLVideoElement;
      return vid ? { currentTime: vid.currentTime, paused: vid.paused } : null;
    });

    console.log('Home video status AFTER landing finished:', afterOpeningStatus);
    expect(afterOpeningStatus).not.toBeNull();
    expect(afterOpeningStatus!.paused).toBe(false);
    // Started from 0:00 and playing smoothly
    expect(afterOpeningStatus!.currentTime).toBeGreaterThan(0);
    expect(afterOpeningStatus!.currentTime).toBeLessThan(2.0);

    // 5. Reload Page (F5): Landing video must be bypassed, home video must play
    await page.reload();
    await page.waitForTimeout(1000);

    await expect(landingOverlay).not.toBeVisible();
    const reloadStatus = await page.evaluate(() => {
      const vid = document.querySelector('video source[src="/videos/home-banner.mp4"]')?.parentElement as HTMLVideoElement;
      return vid ? { currentTime: vid.currentTime, paused: vid.paused } : null;
    });

    console.log('Home video status AFTER reload:', reloadStatus);
    expect(reloadStatus).not.toBeNull();
    expect(reloadStatus!.paused).toBe(false);
  });
});
