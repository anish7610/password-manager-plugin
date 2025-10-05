from selenium.webdriver.common.by import By
from helpers import login, create_account, logout, generate_random_username, validate_text
import time


def test_invalid_user(driver):
    login(driver, "testuser", "1111")
    validate_text(driver, "errorMessage", "User Not Found")


def test_invalid_password(driver):
    test_username = generate_random_username()
    create_account(driver, test_username, "1111")
    login(driver, test_username, "2222")
    validate_text(driver, "errorMessage", "Invalid Credentials")


def test_valid_login(driver):
    test_username = generate_random_username()
    create_account(driver, test_username, "1111")
    login(driver, test_username, "1111")

    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert "Logout" in bodyText

    logout(driver)


def test_logout(driver):
    create_account(driver)
    login(driver)
    logout(driver)

    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert "Sign In" in bodyText


def test_user_session(driver):
    create_account(driver, "test1", "test1")
    login(driver, "test1", "test1")
    
    # Save the current window handle
    main_tab_handle = driver.current_window_handle
    
    # Open a new tab
    driver.execute_script("window.open('about:blank', '_blank');")
    driver.switch_to.window(driver.window_handles[1])
    
    # Load extension in the new tab
    extension_url = f"chrome-extension://fcngofpenigoifmldedigljnnjglmggh/login.html"
    driver.get(extension_url)

    # Validate that user is still logged in
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert "Logout" in bodyText

    # Logout and swith back to the first tab
    logout(driver)
    driver.switch_to.window(main_tab_handle)
    driver.refresh()

    # Validate that user is logged out
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert "Sign In" in bodyText
