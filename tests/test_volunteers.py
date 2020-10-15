from selenium import webdriver
from selenium.webdriver.common.by import By
from web_test_base import WebTestBase
from selenium.common.exceptions import NoSuchElementException

class TestVolunteers(WebTestBase):

    def test_volunteer_confirm_yes(self):
        volun_token = "b9536a93e64a6b39bfdfa20071c3154a"
        driver = self.driver
        driver.get(self.WEBSITE_URL + "volunteer/" + volun_token)

        yes_btn = driver.find_element(By.ID, "yes-btn")
        yes_btn.click()

        try:
            driver.find_element(By.ID, "yes-btn")
            self.fail("Didnt get redirected to yes")
        except NoSuchElementException:
            pass

    def test_volunteer_confirm_no(self):
        volun_token = "924b8d57dc161979854a0958329de431"
        driver = self.driver
        driver.get(self.WEBSITE_URL + "volunteer/" + volun_token)

        no_btn = driver.find_element(By.ID, "no-btn")
        no_btn.click()

        self.assertIn("Du har tackat nej som volontär.",driver.page_source)

    def test_volunteer_invalid_token(self):
        volun_token = "SUPER_INVALID_TOKEN"
        driver = self.driver
        driver.get(self.WEBSITE_URL + "volunteer/" + volun_token)

        self.assertIn("Registrera dig som volontär", driver.page_source)

