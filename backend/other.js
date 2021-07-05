async function loginFacebookGetTrace() {
  if (!checkDriver()) {
    // 檢查Driver是否是設定，如果無法設定就結束程式
    return;
  }

  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build(); // 建立這個browser的類型
  const web = "https:/facebook.com/login"; //我們要前往FB
  await driver.get(web); //在這裡要用await確保打開完網頁後才能繼續動作

  //填入fb登入資訊
  const fb_email_ele = await driver.wait(
    until.elementLocated(By.xpath(`//*[@id="email"]`))
  );
  fb_email_ele.sendKeys(fb_username);
  const fb_pass_ele = await driver.wait(
    until.elementLocated(By.xpath(`//*[@id="pass"]`))
  );
  fb_pass_ele.sendKeys(fb_userpass);

  //抓到登入按鈕然後點擊
  const login_elem = await driver.wait(
    until.elementLocated(By.xpath(`//*[@id="loginbutton"]`))
  );
  login_elem.click();

  // FB有經典版以及新版的區分，兩者的爬蟲路徑不同，我們藉由函式取得各自的路徑
  const { fb_head_path, fb_trace_path } = getCrawlerPath();

  //因為登入這件事情要等server回應，你直接跳轉粉絲專頁會導致登入失敗
  await driver.wait(until.elementLocated(By.xpath(fb_head_path))); //用登入後才有的元件，來判斷是否登入

  //登入成功後要前往粉專頁面
  const fanpage = "https://www.facebook.com/baobaonevertell/"; // 筆者是寶寶不說的狂熱愛好者
  await driver.get(fanpage);
  await driver.sleep(3000);

  let fb_trace = 0; //這是紀錄FB追蹤人數
  //因為考慮到登入之後每個粉專顯示追蹤人數的位置都不一樣，所以就採用全抓在分析
  const fb_trace_eles = await driver.wait(
    until.elementsLocated(By.xpath(fb_trace_path))
  );
  for (const fb_trace_ele of fb_trace_eles) {
    const fb_text = await fb_trace_ele.getText();
    if (fb_text.includes("位追蹤者")) {
      fb_trace = fb_text;
      break;
    }
  }
  console.log(`追蹤人數：${fb_trace}`);
  driver.quit();
}
// loginFacebookGetTrace(); //登入FB取得追蹤者資訊

const twitter_name = process.env.TWITTER_USERNAME;
const twitter_pw = process.env.TWITTER_PASSWORD;

function getCrawlerPathByClass({ loggedin_depend_class, target_class }) {
  return {
    loggedin_depend_ele_path: `//*[contains(@class,"${loggedin_depend_class}")]`,
    target_ele_path: `//*[contains(@class,"${target_class}")]`,
  };
}

async function loginTwitterGetTrace() {
  if (!checkDriver()) {
    return;
  }

  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build();
  const web = "https://twitter.com/login";
  await driver.get(web);

  const twitter_email_ele = await driver.wait(
    until.elementLocated(By.css("input[name='session[username_or_email]']"))
  );
  twitter_email_ele.sendKeys(twitter_name);

  const twitter_pass_ele = await driver.wait(
    until.elementLocated(By.css("input[name='session[password]']"))
  );
  twitter_pass_ele.sendKeys(twitter_pw);

  const twitter_login_elem = await driver.wait(
    until.elementLocated(By.css("div[data-testid='LoginForm_Login_Button']"))
  );
  twitter_login_elem.click();

  const { loggedin_depend_ele_path, target_ele_path } = getCrawlerPathByClass({
    loggedin_depend_class: "r-e7q0ms",
    target_class: "",
  });

  await driver.wait(until.elementLocated(By.xpath(loggedin_depend_ele_path)));

  const targetPage = "https://twitter.com/tokino_sora";
  await driver.get(targetPage);
  await driver.sleep(3000);

  const twitter_trace_ele = await driver.wait(
    until.elementLocated(By.css("a[href='/tokino_sora/following']"))
  );
  const text = await twitter_trace_ele.getText();
  console.log(text);

  const twitter_media_ele = await driver.wait(
    until.elementLocated(By.css("a[href='/tokino_sora/media']"))
  );
  twitter_media_ele.click();

  const twitter_a_eles = await driver.wait(
    until.elementsLocated(By.css("a[role='link']"))
  );
  const linkArr = [];
  for (const twitter_a_ele of twitter_a_eles) {
    const text = await twitter_a_ele.getText();
    console.log(text);
  }
}
function getCrawlerPath() {
  if (process.env.FB_VERSION === "new") {
    //如果是新版FB
    return {
      fb_head_path: `//*[contains(@class,"fzdkajry")]`,
      fb_trace_path: `//*[contains(@class,"oo9gr5id")]`,
    };
  } else {
    //如果為設定皆默認為舊版
    return {
      fb_head_path: `//*[contains(@class,"_1vp5")]`,
      fb_trace_path: `//*[@id="PagesProfileHomeSecondaryColumnPagelet"]//*[contains(@class,"_4bl9")]`,
    };
  }
}
