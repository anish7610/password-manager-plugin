from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from helpers import create_account, login
import pytest
import os


@pytest.fixture(scope="module")
def driver():
    extension_path = os.getcwd()
    extension_id = "<PLUGIN_EXTENSION_ID>"
    extension_url = f"chrome-extension://{extension_id}/login.html"

    chrome_options = Options()
    chrome_options.add_argument(f'--load-extension={extension_path}')
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(extension_url)
    return driver


@pytest.fixture(scope="module")
def setup(driver):
    create_account(driver)
    login(driver)
    
    return driver
