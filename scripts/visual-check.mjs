import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5173/');
await page.locator('.channel').last().waitFor();
await page.screenshot({path:'docs/qa/hero.jpg',quality:55});
await page.setViewportSize({width:375,height:812});
await page.screenshot({path:'docs/qa/phone.jpg',quality:55});
await browser.close();
