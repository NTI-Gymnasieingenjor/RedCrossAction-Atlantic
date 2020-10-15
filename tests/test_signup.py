from selenium import webdriver
from selenium.webdriver.common.by import By
from web_test_base import WebTestBase

class TestSignup(WebTestBase):

    def test_signup(self):
        driver = self.driver
        driver.get(self.WEBSITE_URL)

        firstname = driver.find_element(By.ID, "first_name")
        firstname.send_keys("Kalle")

        firstname = driver.find_element(By.ID, "phonenumber")
        firstname.send_keys("+46746497289")

        dropdown = driver.find_element(By.CLASS_NAME, "select-dropdown")
        dropdown.click()
        area = driver.find_element(By.XPATH, "//*[text()='Uppsala']")
        area.click()

        register = driver.find_element(By.TAG_NAME, "button")
        register.click()

        self.assertIn("Du har registrerat dig som volontär.", driver.page_source)