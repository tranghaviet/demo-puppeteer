// load environment
require('dotenv').config();

const puppeteer = require('puppeteer');
const fs = require('fs');
const configBrowser = require('./config/browser');
const configPages = require('./config/pages');
const configDevices = require('./config/devices');
const configApp = require('./config/app');
const imageHelper = require('./helpers/image');
const imageDownloader = require('image-downloader');

const defaultWaitOptions = {
  // waitUntil: 'domcontentloaded',
  waitUntil: 'load',
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath: configBrowser.executablePath,
    // slowMo: 10,
    headless: false,
    timeout: 100000,
  });

  const amazon = (await browser.pages())[0]; // get first Page (tab)
  await amazon.emulate(configDevices.default);
  // await amazon.goto('https://www.google.com/?gfe_rd=cr&dcr=0&ei=uye3WsnqGeqm8wem06jICQ&gws_rd=cr&fg=1');
  // amazon.waitForNavigation(defaultWaitOptions);
  // let a = await amazon.evaluate(imageHelper.getDataUrlThroughFetch, '#hplogo');
  // imageHelper.getDataUrlThroughFetch('#hplogo').then(result => a = result);
  // a = await imageHelper.parseDataUrl(a);
  // browser.close();

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

  // go to Today's Deals
  await Promise.all([
    amazon.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    // amazon.click('#nav-xshop > a:nth-child(3)'),
    amazon.goto('https://www.amazon.com/gp/goldbox/ref=nav_cs_gb'),
  ]);

  // get all Today's Deals Images
  const images = await amazon.evaluate(() => [...document.querySelectorAll('#dealImage > div > div > div:nth-child(1) > img')].map(e => e.src));

  // we can use "for of" to process array in sequence
  await images.forEach(async (image) => {
    try {
      // const dataUrl = await amazon.evaluate(
      //   imageHelper.getDataUrlByUrl,
      //   image,
      // );

      // const { mime, buffer } = imageHelper.parseDataUrl(dataUrl);
      // fs.writeFileSync(
      // `${configApp.image.path}/${Math.random()}.${mime.split('/')[1]}`, buffer, 'base64');

      const { filename } = await imageDownloader.image({
        url: image,
        dest: configApp.image.path,
      });
      console.log(filename);
    } catch (error) {
      console.log(error);
    }
  });

  browser.close();
})();










// let result = {};

// class AmazonChromeless extends Chromeless {
//   checkLoginCode(selector) {
//     if (this.exists(selector)) {
//       let gmail = new Chromeless({
//         debug: true,
//       })
//       .setUserAgent(config.browser.useragent)
//       .goto('https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail&sacu=1&rip=1#identifier')
//       .type(process.env.AMAZON_EMAIL, 'input#Email')
//       .click('input#next')
//       .wait('input#Passwd')
//       .type(process.env.GMAIL_PASSWORD, 'input#Passwd')
//       .click('input#signIn')
//       // .wait('div#\3a h4 div > div')
//       ;
//     }
//   }
// }

// async function run() {
//   const chromeless = new AmazonChromeless({
//     // debug: true,
//   });

//   cookie = await chromeless
//   .setUserAgent(config.browser.useragent)
//   .goto(config.amazon.loginPath)
//   .type(process.env.AMAZON_EMAIL, 'input#ap_email')
//   // .press(KEY_CODE_ENTER)
//   .click('input#continue')
//   .wait('input#ap_password')
//   .click('input[name="rememberMe"]')
//   .type(process.env.AMAZON_PASSWORD, 'input#ap_password')
//   // .press(KEY_CODE_ENTER)
//   .click('input#continue')
//   // .checkLoginCode('input[name="code"]')
//   // .wait('div#nav-xshop > a:nth-child(4)')
//   // .click('div#nav-xshop > a:nth-child(4)')
//   // .wait('div#FilterItemView_all_summary span:nth-child(3)')
//   // .screenshot()
//   //neu xh trang nhap code thi:
//   // .ifAppear('input[name="code"]')
//   // .getCodeFromeGmail
//   // .type(CODE, 'input[name="code"')
//   // .click
//   .wait(200000)
//   ;

//   new Chromeless()
//   .goto('amazon.com')


//   console.log(result);

//   await chromeless.end();
// }

// // run().catch(console.error.bind(console));
