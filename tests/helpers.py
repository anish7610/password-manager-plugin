from selenium.webdriver.common.by import By
import string
import random
import time


def create_account(driver, username = "test", password = "test"):
    register_button = driver.find_element(By.ID, 'register')
    register_button.click()
    
    username_input = driver.find_element(By.ID, 'username')
    username_input.send_keys(username)

    # Find the password input field and fill it with a test password
    password_input = driver.find_element(By.ID, 'password')
    password_input.send_keys(password)
    
    create_account_button = driver.find_element(By.ID, 'create_account')
    create_account_button.click()
    
    time.sleep(0.2)
    

def login(driver, username = "test", password = "test"):
    username_input = driver.find_element(By.ID, 'loginUser')
    username_input.send_keys(username)

    # Find the password input field and fill it with a test password
    password_input = driver.find_element(By.ID, 'loginPass')
    password_input.send_keys(password)

    login_button = driver.find_element(By.ID, 'login')
    login_button.click()

    time.sleep(0.2)


def logout(driver):
    logout_link = driver.find_element(By.ID, "logout")
    logout_link.click()


def validate_text(driver, element, expected_text):
    actual_error_message = driver.find_element(By.ID, element).text
    assert actual_error_message == expected_text


def generate_random_username():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k = 10))
