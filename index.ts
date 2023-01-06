import puppeteer, { Page } from 'puppeteer';
import * as schedule from 'node-schedule'
import * as fs from 'fs';

const LINKEDIN_EMAIL = process.env.EMAIL;
const LINKEDIN_PASSWORD = process.env.PASSWORD;
const LINKEDIN_TEXT = "Bonjour, vous venez de gagner 25.00€.\n\nCeci est un post automatique indiquant que Paul n'as pas fait son exercice quotidien Leetcode.\nPour le punir, les 5 premieres personnes qui commentent avec leur compte Paypal recevront 5.00€.\n\nQue voulez-vous, à chacun sa méthode pour respecter ses résolutions...";
const LEETCODE_USER = 'Mortufac';

const delay = (milliseconds:number) => new Promise(r => setTimeout(r, milliseconds));

async function getLeetCodeStats(page:Page) {
  await page.goto(`https://leetcode.com/${LEETCODE_USER}`, {waitUntil: 'load'});
  await page.waitForSelector('#__next > div > div.mx-auto.mt-\\[50px\\].w-full.grow.p-4.md\\:mt-0.md\\:max-w-\\[888px\\].md\\:p-6.lg\\:max-w-screen-xl > div > div.w-full.lc-lg\\:max-w-\\[calc\\(100\\%_-_316px\\)\\] > div.flex.w-full.flex-col.space-x-0.space-y-4.lc-xl\\:flex-row.lc-xl\\:space-y-0.lc-xl\\:space-x-4.mt-4.lc-lg\\:mt-0 > div.min-w-max.max-w-full.w-full.flex-1 > div > div.mx-3.flex.items-center.lc-xl\\:mx-8 > div.mr-8.mt-6.flex.min-w-\\[100px\\].justify-center > div > div > div > div.text-\\[24px\\].font-medium.text-label-1.dark\\:text-dark-label-1');
  return await page.evaluate(() => document.querySelector("#__next > div > div.mx-auto.mt-\\[50px\\].w-full.grow.p-4.md\\:mt-0.md\\:max-w-\\[888px\\].md\\:p-6.lg\\:max-w-screen-xl > div > div.w-full.lc-lg\\:max-w-\\[calc\\(100\\%_-_316px\\)\\] > div.flex.w-full.flex-col.space-x-0.space-y-4.lc-xl\\:flex-row.lc-xl\\:space-y-0.lc-xl\\:space-x-4.mt-4.lc-lg\\:mt-0 > div.min-w-max.max-w-full.w-full.flex-1 > div > div.mx-3.flex.items-center.lc-xl\\:mx-8 > div.mr-8.mt-6.flex.min-w-\\[100px\\].justify-center > div > div > div > div.text-\\[24px\\].font-medium.text-label-1.dark\\:text-dark-label-1").innerHTML);
}

async function logToLinkedIn(page:Page) {
  await page.goto('https://www.linkedin.com/home', {waitUntil: 'load'});
  await page.waitForSelector('#session_password');
  await page.focus('#session_key');
  await page.keyboard.type(LINKEDIN_EMAIL);
  await page.focus('#session_password');
  await page.keyboard.type(LINKEDIN_PASSWORD);
  await page.keyboard.press('Enter');
}

async function createPost(page:Page, post:string) {
  await page.reload({timeout: 1000});
  await page.waitForSelector('#main > div:nth-child(1) > div > div > button');
  await page.evaluate(() => {
    const button = document.querySelector("#main > div:nth-child(1) > div > div > button") as HTMLElement;
    button.click();
  });
  await page.waitForSelector('div.ql-editor.ql-blank > p');
  await delay(2000);
  await page.evaluate((post:string) => document.querySelector('div.ql-editor.ql-blank > p').innerHTML = post, post);
  await page.waitForSelector('button:not([disabled]).share-actions__primary-action');
  await page.evaluate(() => {
    const button = document.querySelector('button:not([disabled]).share-actions__primary-action') as HTMLElement;
    button.click();
  });
}

function getCurrentProblemsSolved() {
  try {
    const counter = fs.readFileSync('./counter', 'utf-8');
    return +counter;
  } catch {
    fs.writeFileSync('./counter', '0', 'utf-8');
    return 0;
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const currentProblemsSolved = getCurrentProblemsSolved();
  const problemsSolved = await getLeetCodeStats(page);

  if (+problemsSolved <= currentProblemsSolved) {
    await logToLinkedIn(page);
    await createPost(page, LINKEDIN_TEXT);
  } else {
    fs.writeFileSync('./counter', problemsSolved, 'utf-8');
  }
  await browser.close();
}

schedule.scheduleJob('0 0 * * *', main);
