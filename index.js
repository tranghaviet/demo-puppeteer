// load environment
require('dotenv').config();

const puppeteer = require('puppeteer');
// const fs = require('fs');
const configBrowser = require('./config/browser');
const configPages = require('./config/pages');
const configDevices = require('./config/devices');
const configApp = require('./config/app');
// const imageHelper = require('./helpers/image');
const imageDownloader = require('image-downloader');

const defaultWaitOptions = {
  // waitUntil: 'domcontentloaded',
  waitUntil: 'load',
};

async function lunchBrowser() {
  const browser = await puppeteer.launch({
    executablePath: configBrowser.executablePath,
    // slowMo: 10,
    headless: false,
    timeout: 100000,
  });

  return browser;
}

async function loginAmazon(browser) {
  const amazon = (await browser.pages())[0]; // get first Page (tab)
  await amazon.emulate(configDevices.default);

  await amazon.goto(configPages.amazon.loginPath, defaultWaitOptions);

  // enter email
  await amazon.type('input#ap_email', process.env.AMAZON_EMAIL);
  await Promise.all([
    amazon.waitForNavigation(defaultWaitOptions),
    amazon.keyboard.press('Enter'),
  ]);
  // enter password
  await amazon.click('input[name="rememberMe"]');
  await amazon.type('input#ap_password', process.env.AMAZON_PASSWORD);
  await Promise.all([
    amazon.waitForNavigation(defaultWaitOptions),
    amazon.keyboard.press('Enter'),
  ]);

  return amazon;
}

async function downloadImagesAtTodayDeal(page) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.goto('https://www.amazon.com/gp/goldbox/ref=nav_cs_gb'),
  ]);

  // get all Today's Deals Images
  const images = await page.evaluate(() => [...document.querySelectorAll('#dealImage > div > div > div:nth-child(1) > img')].map(e => e.src));

  // we can use "for of" to process array in sequence
  await images.forEach(async (image) => {
    try {
      const { filename } = await imageDownloader.image({
        url: image,
        dest: configApp.image.path,
      });
      console.log(filename);
    } catch (error) {
      console.log(error);
    }
  });
}

(async () => {
  const browser = await lunchBrowser();

  const amazon = await loginAmazon(browser);

  await downloadImagesAtTodayDeal(amazon);

  browser.close();
})();
