require("dotenv").config(); //載入.env環境檔

const webdriver = require("selenium-webdriver"), // 加入虛擬網頁套件
  By = webdriver.By, //你想要透過什麼方式來抓取元件，通常使用xpath、css
  until = webdriver.until; //直到抓到元件才進入下一步(可設定等待時間)

const chrome = require("selenium-webdriver/chrome");
const options = new chrome.Options();
options.setUserPreferences({
  "profile.default_content_setting_values.notifications": 1,
}); //因為FB會有notifications干擾到爬蟲，所以要先把它關閉

const path = require("path"); //用於處理文件路徑的小工具
const fs = require("fs"); //讀取檔案用

function checkDriver() {
  try {
    chrome.getDefaultService(); //確認是否有預設
  } catch {
    console.warn("找不到預設driver!");
    const file_path = "../chromedriver.exe"; //'../chromedriver.exe'記得調整成自己的路徑
    console.log(path.join(__dirname, file_path)); //請確認印出來日誌中的位置是否與你路徑相同
    if (fs.existsSync(path.join(__dirname, file_path))) {
      //確認路徑下chromedriver.exe是否存在
      const service = new chrome.ServiceBuilder(
        path.join(__dirname, file_path)
      ).build(); //設定driver路徑
      chrome.setDefaultService(service);
      console.log("設定driver路徑");
    } else {
      console.error("無法設定driver路徑");
      return false;
    }
  }
  return true;
}

// @@@@@@@@@@@@@@@@@@@@@@@@抓PTT BEAUTY

// 要從第幾篇文章開始抓的變數,
let i = null;

async function pttCrawler(current, pageSize) {
  console.log(`current is ${current}, page size is ${pageSize}`);
  if (!checkDriver()) {
    return;
  }

  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build();
  const web = "https://www.ptt.cc/bbs/Beauty/index.html";
  await driver.get(web);

  const checkAdult = await driver.wait(
    until.elementLocated(By.css("button[name='yes']"))
  );
  checkAdult.click();

  // 搜尋爆文
  const searchInput = await driver.wait(
    until.elementLocated(By.css("input[placeholder='搜尋文章⋯']"))
  );
  await searchInput.sendKeys("recommend:99", webdriver.Key.ENTER);

  // 找到頁面中有所有文章連結

  i = current;
  let allPics = [];

  while (i < current + pageSize) {
    const articleLinks = await driver.wait(
      until.elementsLocated(By.css("div.title a"))
    );
    if (articleLinks.length !== 0) {
      await articleLinks[i].click();

      // 找到文章內所有圖片連結
      const imgLinks = await driver.findElements(By.css("a[rel='nofollow']"));
      if (imgLinks) {
        // 將圖片連結推進要回傳的陣列裡
        for (let link of imgLinks) {
          let linkText = await link.getText();
          allPics.push(linkText);
        }
      }
      await driver.navigate().back();
      await driver.sleep(500);

      // i + 1來進入下一篇文章
      i++;
    }
  }
  console.log("///////////////////////loop end///////////////////////");
  driver.quit();

  const result = allPics.filter((link) => link.includes("imgur"));
  return result;
}

const Websocket = require("ws");
const ws = new Websocket.Server({ port: 8080 });

ws.on("open", () => {
  console.log("connect open");
});
ws.on("close", () => console.log("connect close"));
ws.on("connection", (ws, req) => {
  ws.on("message", async (message) => {
    console.log("message", message);

    const requestParams = JSON.parse(message);
    const beautyPic = await pttCrawler(
      parseInt(requestParams.current),
      parseInt(requestParams.pageSize)
    );
    const responseJson = JSON.stringify({ pics: beautyPic, current: i });
    ws.send(responseJson);
  });
});
