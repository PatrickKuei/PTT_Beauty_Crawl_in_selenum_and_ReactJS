const utilities = require("./utilities");
// require("dotenv").config(); //載入.env環境檔

const webdriver = require("selenium-webdriver"); // 加入虛擬網頁套件
const By = webdriver.By; // 找元件的方法, By.css or By.xpath etc
const until = webdriver.until; // 直到抓到元件才進入下一步

exports.beautyCrawl = async function (current, pageSize) {
  // 確認是否設定爬蟲瀏覽器
  if (!utilities.checkDriver()) {
    return;
  }

  let driver = await new webdriver.Builder().forBrowser("chrome").build();
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

  let i = current; // 要從第幾篇文章開始抓的變數
  let allPics = [];

  while (i < current + pageSize) {
    // 找到頁面中有所有文章連結
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
  return { urls: result, current: i };
};
