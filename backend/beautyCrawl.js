const utilities = require("./utilities");
// require("dotenv").config(); //載入.env環境檔

const webdriver = require("selenium-webdriver"); // 加入虛擬網頁套件
const By = webdriver.By; // 找元件的方法, By.css or By.xpath etc
const until = webdriver.until; // 直到抓到元件才進入下一步

exports.beautyCrawl = async function (current, pageSize, ws) {
  // 確認是否設定爬蟲瀏覽器
  if (!utilities.checkDriver()) {
    return;
  }
  await ws.send(JSON.stringify({ isCompleted: false, progress: 10 }));

  let driver = await new webdriver.Builder().forBrowser("chrome").build();
  const web = "https://www.ptt.cc/bbs/Beauty/index.html";
  await driver.get(web);
  await ws.send(JSON.stringify({ isCompleted: false, progress: 20 }));

  const checkAdult = await driver.wait(
    until.elementLocated(By.css("button[name='yes']"))
  );
  await checkAdult.click();
  await ws.send(JSON.stringify({ isCompleted: false, progress: 30 }));

  // 搜尋爆文
  const searchInput = await driver.wait(
    until.elementLocated(By.css("input[placeholder='搜尋文章⋯']"))
  );
  await searchInput.sendKeys("recommend:99", webdriver.Key.ENTER);
  await ws.send(JSON.stringify({ isCompleted: false, progress: 60 }));

  let currentAtPage = current % 20; // 該頁第幾篇開始抓
  let pageNumber = Math.floor(current / 20); // 第幾頁

  // 跳轉到目標頁
  while (pageNumber > 0) {
    const prevPage = await driver.wait(
      until.elementLocated(By.css("div.btn-group-paging a:nth-child(2)"))
    );
    await prevPage.click();
    pageNumber--;
  }

  let i = currentAtPage; // 用i來計算
  let allPics = [];
  let max = current + pageSize;

  while (current < max) {
    if (i >= 20) {
      const prevPage = await driver.wait(
        until.elementLocated(By.css("div.btn-group-paging a:nth-child(2)"))
      );
      await prevPage.click();
      i -= 20;
    }

    // 找到頁面中有所有文章連結
    const articleLinks = await driver.wait(
      until.elementsLocated(By.css("div.title a"))
    );
    if (articleLinks.length !== 0) {
      await articleLinks[i].click();
      await ws.send(JSON.stringify({ isCompleted: false, progress: 90 }));

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
      current++;
    }
  }
  console.log("///////////////////////loop end///////////////////////");
  await ws.send(JSON.stringify({ isCompleted: false, progress: 100 }));

  driver.quit();

  const result = allPics.filter(
    (link) =>
      link.includes("imgur") && link.substring(link.length - 3) === "jpg"
  );
  return { urls: result, current: i };
};
