from selenium.webdriver.common.by import By
from helpers import login, create_account, generate_random_username, validate_text
import json
import random
import csv
import os
import time
import pytest


def add_password(driver, site_data):
    # Add Password Form selectors
    add_password_button = driver.find_element(By.ID, "addPassword")
    close_button = driver.find_element(By.ID, "closeButton")
    submit_password_button = driver.find_element(By.ID, "addPasswordFormButton")
    site_username_input = driver.find_element(By.ID, "siteUsername")
    site_password_input = driver.find_element(By.ID, "password")
    site_website_input = driver.find_element(By.ID, "website")

    # Add Password
    add_password_button.click()
    site_username_input.clear()
    site_password_input.clear()
    site_website_input.clear()
    site_username_input.send_keys(site_data["siteUsername"])
    site_password_input.send_keys(site_data["sitePassword"])
    site_website_input.send_keys(site_data["website"])
    submit_password_button.click()
    close_button.click()


def edit_form_fields(driver, list_item_id, edit_field_values):
    # Click Edit
    edit_button_xpath = f"//li[{list_item_id}]/button[2]"
    edit_button = driver.find_element(By.XPATH, edit_button_xpath)
    edit_button.click()
    
    # Edit Form Fields
    site_username_input = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/div[1]/input")
    site_password_input = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/div[2]/div/input")
    site_website_input = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/div[3]/input")
    edit_form_submit_button = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/button[1]")

    # Edit Form
    site_username_input.clear()
    site_username_input.send_keys(edit_field_values["username"])

    site_password_input.clear()
    site_password_input.send_keys(edit_field_values["password"])

    site_website_input.clear()
    site_website_input.send_keys(edit_field_values["website"])

    edit_form_submit_button.click()


def validate_form_fields(driver, list_item_id, edit_field_values):
    # Validate Edited website in list item
    link_text = driver.find_element(By.XPATH,  f"//li[{list_item_id}]/a")
    assert edit_field_values["website"] == link_text.text

    # Validate Edited Form Fields
    edit_button_xpath = f"//li[{list_item_id}]/button[2]"
    driver.find_element(By.XPATH, edit_button_xpath).click()
    
    site_username_input = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/div[1]/input")
    assert site_username_input.get_attribute("value") == edit_field_values["username"]

    site_password_input = driver.find_element(By.XPATH, f"//li[{list_item_id}]/form/div[2]/div/input")
    assert site_password_input.get_attribute("value") == edit_field_values["password"]


def validate_csv(driver, file_path, expected_site_data):
    outputCSVFile = driver.find_element(By.ID, "exportedFile")
    outputCSVFile.click()

    # Wait for file download
    time.sleep(0.2)

    with open(file_path, 'r') as f:
        csv_reader = csv.DictReader(f)
        
        for row_no, row in enumerate(csv_reader):
            assert row["siteUsername"] == expected_site_data[row_no]["siteUsername"]
            assert row["password"] == expected_site_data[row_no]["sitePassword"]
            assert row["website"] == expected_site_data[row_no]["website"]
 

def validate_show_hide_password(show_button, password_input):
    password_input.clear()
    password_input.send_keys("password123")

    assert password_input.get_attribute("type") == "password"
    assert show_button.text == "Show"

    show_button.click()

    assert password_input.get_attribute("type") == "text"
    assert show_button.text == "Hide"


def delete_passwords(driver):
    delete_all_passwords = """
        var request = indexedDB.open('plugindb', 1);
        request.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction(['passwords'], 'readwrite');
        var objectStore = transaction.objectStore('passwords');
        var clearRequest = objectStore.clear();
        clearRequest.onsuccess = function(event) {
            console.log('All entries deleted successfully');
        };
        clearRequest.onerror = function(event) {
            console.error('Error deleting entries:', event.target.error);
        };
        };
    """
    driver.execute_script(delete_all_passwords)
    driver.refresh()

    # Validate passwords are deleted
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert 'Edit' not in bodyText


def test_add_password(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        site_data = json.load(f)[:2]

    for site in site_data: add_password(driver, site)

    for idx, site in enumerate(site_data):
        link_text = driver.find_element(By.XPATH, f"//*[@id={idx + 1}]/a")
        assert site["website"] == link_text.text

    delete_passwords(driver)


def test_edit_password(setup):
    driver = setup
    
    with open('test_data.json', 'r') as f:
        site_data = json.load(f)
    
    for site in site_data: add_password(driver, site)

    list_item_id = random.randint(1, len(site_data))

    edit_field_values = {
        "username": "qa",
        "password": "1111",
        "website": "edited_" + site_data[list_item_id - 1]["website"]
    }

    edit_form_fields(driver, list_item_id, edit_field_values)    

    validate_form_fields(driver, list_item_id, edit_field_values)

    delete_passwords(driver)


def test_delete_password(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        test_data = json.load(f)
    
    site_data = random.choice(test_data)
    add_password(driver, site_data)
    
    delete_button = driver.find_element(By.XPATH, "//li[1]/button[1]")
    delete_button.click()

    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert site_data["website"] not in bodyText


def test_export_passwords(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        site_data = json.load(f)

    for site in site_data: add_password(driver, site)
    
    export_link = driver.find_element(By.ID, "exportPasswords")
    export_link.click()
    
    # Update this to your browser's default download location
    download_dir = "/Users/anish/Downloads"
    filename = "test_" + str(random.randint(1, 100))
    # print("Export FileName: ", filename)
    file_path = os.path.join(download_dir, filename)
    
    filename_input = driver.find_element(By.ID, "outputFile")
    filename_input.send_keys(filename)
    export_button = driver.find_element(By.XPATH, "//button[text()='Export']")
    export_button.click()
    
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert f"Download File: {filename}.csv" in bodyText

    validate_csv(driver, file_path + ".csv", site_data)

    # cleanup
    home_page = driver.find_element(By.ID, "home")
    home_page.click()

    delete_passwords(driver)


def test_import_passwords(setup):
    driver = setup

    filename = "test_data.csv"
    file_path = os.path.join(os.getcwd(), "tests", filename)

    import_link = driver.find_element(By.ID, "importPasswords")
    import_link.click()
    file_upload_input = driver.find_element(By.ID, "fileInput")
    file_upload_input.send_keys(file_path)

    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert "Passwords imported successfully" in bodyText
    
    home_page = driver.find_element(By.ID, "home")
    home_page.click()
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    
    with open(file_path, 'r') as f:
        csv_reader = csv.DictReader(f) 
        num_of_rows = len(list(csv_reader))

        for row in csv_reader:
            assert row["website"] in bodyText

    delete_passwords(driver)


@pytest.mark.parametrize("form", ["add", "edit"])
def test_show_hide_password(setup, form):
    driver = setup
    if form == "add":
        add_password_button = driver.find_element(By.ID, "addPassword")
        add_password_button.click()

        show_button = driver.find_element(By.ID, "showPassword")
        password_input = driver.find_element(By.ID, "password")
        close_button = driver.find_element(By.ID, "closeButton")
    elif form == "edit":
        site_data = {
            "siteUsername": "qa",
            "sitePassword": "1234",
            "website": "facebook.com"
        }

        add_password(driver, site_data)

        edit_button_xpath = f"//li[1]/button[2]"
        edit_button = driver.find_element(By.XPATH, edit_button_xpath)
        edit_button.click()

        show_button = driver.find_element(By.XPATH, "//ul/li[1]/form/div[2]/div/button")
        password_input = driver.find_element(By.XPATH, "//li[1]/form/div[2]/div/input")
        close_button = driver.find_element(By.XPATH, "//ul/li[1]/form/button[2]")

    validate_show_hide_password(show_button, password_input)
    close_button.click()