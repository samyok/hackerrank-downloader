const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");

const slug = "birdso2023-cybersec-c-sat-feb";

const getWSUrl = async () => {
  return new Promise((resolve, reject) => {
    axios.get("http://127.0.0.1:9223/json/version")
      .then(async (response) => {
        resolve(response.data.webSocketDebuggerUrl);
      })
  });
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const JSONDump = (filename, obj) => {
  fs.writeFileSync(filename, JSON.stringify(obj));
}

const getSubmissions = async () => {
  const wsUrl = await getWSUrl();

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  let responses = [];


  let curPage = 1;

  while (true) {

    await page.goto(`https://www.hackerrank.com/contests/${slug}/judge/submissions/${curPage}`);

    await page.waitForSelector(".table-body");

    console.log("doing page",  page.url());

    const pg = await page.evaluate(() => {
      return [...document.querySelectorAll(".judge-submissions-list-view")].map(tr => ({
        user: tr.querySelector("div:nth-child(2)").innerText,
        time: tr.querySelector("div:nth-child(5)").innerText,
        score: tr.querySelector("div:nth-child(7)").innerText,
        link: tr.querySelector(".span1 a").href,
        date: new Date(1676120340000 + parseInt(tr.querySelector("div:nth-child(5)").innerText) * 60 * 1000).getTime(),
        problem: tr.querySelector("a").href.split("/").pop(),
      }))

    });


    const hasNoMorePages = await page.evaluate(() => {
      return document.querySelector(".caret.right").parentElement.parentElement.classList.contains("disabled");
    });

    responses = responses.concat(pg);

    if (hasNoMorePages) break;

    curPage++;

  }

  JSONDump("submissions.json", responses);

  await page.close();
};

getSubmissions();