const puppeteer = require('puppeteer');
const configBrowser = require('./config/browser');
const imageHelper = require('./helpers/image');
const fs = require('fs');

const defaultWaitOptions = {
  waitUntil: 'load',
};

puppeteer.launch({
  executablePath: configBrowser.executablePath,
  slowMo: 10,
  headless: false,
}).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://www.google.com.vn/?gfe_rd=cr&dcr=0&ei=Nbi9Wq37CaXpugT95ZuADA', defaultWaitOptions);

  try {
    const options = { cache: 'no-cache' };
    const dataUrl = await page.evaluate(imageHelper.getDataUrlThroughFetch, '#hplogo', options);
    const { mime, buffer } = imageHelper.parseDataUrl(dataUrl);
    // assert.equal(mime, 'image/png');
    // assert.equal(mime, 'image/jpeg');
    fs.writeFileSync(`storage/img/logo-fetch.${mime.split('/')[1]}`, buffer, 'base64');
  } catch (error) {
    console.log(error);
  }

  await browser.close();
});
