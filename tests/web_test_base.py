#!/usr/bin/env python3
import unittest, os, sys
from subprocess import check_output
from selenium import webdriver
from selenium.webdriver.firefox.options import Options as options
from selenium.webdriver.firefox.service import Service

class WebTestBase(unittest.TestCase):

    @classmethod
    def setUpClass(self):
        self.WEBSITE_URL = "http://127.0.0.1:8080/"
        
        try:
            firefox_binary = check_output(["which", "firefox"]).decode().strip()
        except:
            print("Could not find any firefox installed")
            sys.exit(1)

        # Set up firefox service and options
        ops = options()
        ops.headless = True
        ops.binary_location = firefox_binary

        self.driver = webdriver.Firefox(executable_path=os.getcwd()+"/../geckodriver", options=ops)

        self.driver.implicitly_wait(3)

    @classmethod
    def tearDownClass(self):
        self.driver.quit()
