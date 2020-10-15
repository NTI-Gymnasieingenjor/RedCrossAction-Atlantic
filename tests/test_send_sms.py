from selenium import webdriver
from selenium.webdriver.common.by import By
from web_test_base import WebTestBase
from selenium.common.exceptions import NoSuchElementException

class TestJourLogin(WebTestBase):

    def test_jour_login(self):
        driver = self.driver
        driver.get(self.WEBSITE_URL + "jour/login")

        def send_keys_to_id(keys: str, id: str):
            element = driver.find_element(By.ID, id)
            element.send_keys(keys)

        # Log in
        send_keys_to_id("admin", "username")
        send_keys_to_id("admin", "password")
        login = driver.find_element(By.TAG_NAME, "button")
        login.click()

        # Form
        send_keys_to_id("Testkris",                 "notification-name")
        send_keys_to_id("100",                      "volunteers-needed")
        send_keys_to_id("Regnkläder och handskar",  "clothing-gear-needed")
        send_keys_to_id("Mora, Morastrand",         "samlingsplats")
        send_keys_to_id("16/9/2020",                "datum")
        send_keys_to_id("15:00",                    "tidpunkt")
        send_keys_to_id("Städning, Kaffedrickande", "help_tasks")
        send_keys_to_id("Det är kris",              "textarea2")

        # Select county
        dropdown = driver.find_element(By.CLASS_NAME, "select-dropdown")
        dropdown.click()
        area = driver.find_element(By.XPATH, "//*[text()='Uppsala']")
        area.click()

        # Send
        send = driver.find_element(By.TAG_NAME, "button")
        send.click()

        # Tries to find chart on current page
        try:
            driver.find_element(By.ID, "myChart")
        except NoSuchElementException:
            self.fail("Could not send sms (could not find chart on current page)")