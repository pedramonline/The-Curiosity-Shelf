import {chromium} from '@playwright/test';
import lighthouse from 'lighthouse';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--remote-debugging-port=9223']});
try {
 const result=await lighthouse('http://127.0.0.1:4173/',{port:9223,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
 await fs.writeFile('docs/qa/lighthouse.json',result.report);
 console.log(JSON.stringify(Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score]))));
 console.log(JSON.stringify(Object.entries(result.lhr.audits).filter(([k,v])=>v.score!==null&&v.score<1&&v.details).map(([k,v])=>({id:k,title:v.title,score:v.score})).slice(0,20)));
} finally { await browser.close(); }
