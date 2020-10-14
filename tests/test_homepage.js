const {Builder} = require("selenium-webdriver");
const firefox = require('selenium-webdriver/firefox');

const options = new firefox.Options();
options.setBinary("./geckodriver");

async function testHomepage() {
    let driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();

    await driver.get("http://127.0.0.1:8080/");

    const header = driver.findElement(By.xpath("//*[text()='Krishanteringssystem']"));

    console.log(header)

    await driver.quit();
};

testHomepage();