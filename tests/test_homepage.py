from selenium import webdriver
from selenium.webdriver.common.by import By
from web_test_base import WebTestBase
from selenium.common.exceptions import NoSuchElementException

class TestHomepage(WebTestBase):

    def test_homepage(self):
        driver = self.driver
        driver.get(self.WEBSITE_URL)

        try:
            header = driver.find_element(By.XPATH, "//*[contains(text(), 'Krishanteringssystem')]")
        except NoSuchElementException:
            self.fail("Could not find element with text: 'Krishanteringssystem'")