const chrome = require("selenium-webdriver/chrome");

const path = require("path"); //用於處理文件路徑的小工具
const fs = require("fs"); //讀取檔案用

exports.checkDriver = function () {
  console.log("...check driver");
  try {
    chrome.getDefaultService(); //確認是否有預設
    console.log("chrome is default driver");
  } catch {
    console.warn("找不到預設driver!");
    const file_path = "../chromedriver.exe"; // 使用chromedriver來當爬蟲瀏覽器

    //確認路徑下chromedriver.exe是否存在
    if (fs.existsSync(path.join(__dirname, file_path))) {
      const service = new chrome.ServiceBuilder(
        path.join(__dirname, file_path)
      ).build(); //設定chromedriver路徑
      chrome.setDefaultService(service);
      console.log("設定chromedriver路徑");
    } else {
      console.error("無法設定driver路徑");
      return false;
    }
  }
  return true;
};
