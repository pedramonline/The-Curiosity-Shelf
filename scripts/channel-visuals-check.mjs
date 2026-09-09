import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:1000},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5173/#explore');
await expect(page.locator('.featured-upload')).toHaveCount(14);
await expect(page.locator('.channel-recent .compact-upload')).toHaveCount(28);
for (const card of await page.locator('.channel').all()) {
 await card.scrollIntoViewIfNeeded();
 await expect(card.locator('.channel-avatar')).toHaveJSProperty('complete',true);
 await expect(card.locator('.channel-avatar')).not.toHaveJSProperty('naturalWidth',0);
 await expect(card.locator('.featured-upload img')).toHaveJSProperty('complete',true);
 await expect(card.locator('.featured-upload img')).not.toHaveJSProperty('naturalWidth',0);
}
await page.getByRole('button',{name:'Explore channel: Kurzgesagt',exact:true}).click();
await expect(page.locator('.detail-uploads .channel-upload')).toHaveCount(9);
await page.getByRole('button',{name:'Close channel details'}).click();
await page.locator('#explore').scrollIntoViewIfNeeded();
await page.screenshot({path:'docs/qa/channel-visuals.jpg',quality:70});
await page.setViewportSize({width:375,height:812});
await page.locator('.channel').first().scrollIntoViewIfNeeded();
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.screenshot({path:'docs/qa/channel-visuals-mobile.jpg',quality:65});
console.log('PASS: all 14 real avatars and featured thumbnails loaded; 28 additional previews; 9 uploads in channel details; mobile has no overflow.');
await browser.close();
