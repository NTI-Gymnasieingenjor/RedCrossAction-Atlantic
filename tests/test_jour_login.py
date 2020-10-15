from selenium import webdriver
from selenium.webdriver.common.by import By
from web_test_base import WebTestBase

class TestJourLogin(WebTestBase):

    def test_jour_login(self):
        driver = self.driver
        driver.get(self.WEBSITE_URL + "jour/login")

        username = driver.find_element(By.ID, "username")
        username.send_keys("admin")

        password = driver.find_element(By.ID, "password")
        password.send_keys("admin")

        login = driver.find_element(By.TAG_NAME, "button")
        login.click()

        self.assertIn("http://127.0.0.1:8080/jour/dashboard", driver.current_url)