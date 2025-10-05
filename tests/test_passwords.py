from selenium.webdriver.common.by import By
from helpers import login, create_account, generate_random_username, validate_text
import json
import random
import csv
import os
import time


def add_password(driver, site_data):
    add_password_button = driver.find_element(By.ID, "addPassword")
    close_button = driver.find_element(By.ID, "closeButton")
    submit_password_button = driver.find_element(By.ID, "addPasswordFormButton")
    site_username_input = driver.find_element(By.ID, "siteUsername")
    site_password_input = driver.find_element(By.ID, "password")
    site_website_input = driver.find_element(By.ID, "website")

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
    edit_button_xpath = f"//*[@id={list_item_id}]/button[2]"
    edit_button = driver.find_element(By.XPATH, edit_button_xpath)
    edit_button.click()
    
    # Edit Form Fields
    site_username_input = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/div[1]/input")
    site_password_input = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/div[2]/input")
    site_website_input = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/div[3]/input")
    edit_form_submit_button = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/button[1]")

    # Edit Form
    site_username_input.clear()
    site_username_input.send_keys(edit_field_values["username"])

    site_password_input.clear()
    site_password_input.send_keys(edit_field_values["password"])

    site_website_input.clear()
    site_website_input.send_keys(edit_field_values["website"])
    
    edit_form_submit_button.click()


def validate_form_fields(driver, list_item_id, edit_field_values):
    # Validate edited website in list item
    link_text = driver.find_element(By.XPATH, f"//*[@id={list_item_id}]/a") 
    assert edit_field_values["website"] == link_text.text

    # Validate edited form fields
    edit_button_xpath = f"//*[@id={list_item_id}]/button[2]"
    driver.find_element(By.XPATH, edit_button_xpath).click()
    
    site_username_input = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/div[1]/input")
    assert site_username_input.get_attribute("value") == edit_field_values["username"]

    site_password_input = driver.find_element(By.XPATH, f"/html/body/div[2]/ul/li[{list_item_id}]/form/div[2]/input")
    assert site_password_input.get_attribute("value") == edit_field_values["password"]


def validate_csv(driver, file_path, expected_site_data):
    outputCSVFile = driver.find_element(By.ID, "exportedFile")
    outputCSVFile.click()
    time.sleep(0.2)

    with open(file_path, 'r') as f:
        csv_reader = csv.DictReader(f)
        
        for row_no, row in enumerate(csv_reader):
            assert row["siteUsername"] == expected_site_data[row_no]["siteUsername"]
            assert row["password"] == expected_site_data[row_no]["sitePassword"]
            assert row["website"] == expected_site_data[row_no]["website"]
 

def delete_passwords(driver, num_of_passwords):
    for i in range(1, num_of_passwords + 1):
        delete_button_xpath = f"//*[@id={i}]/button[1]"
        delete_button = driver.find_element(By.XPATH, delete_button_xpath)
        delete_button.click()
        time.sleep(0.2)


def test_add_password(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        site_data = json.load(f)[:2]

    for site in site_data: add_password(driver, site)

    for idx, site in enumerate(site_data):
        link_text = driver.find_element(By.XPATH, f"//*[@id={idx + 1}]/a")
        assert site["website"] == link_text.text


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
    
    # cleanup
    delete_passwords(driver, len(site_data))


def test_delete_password(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        test_data = json.load(f)
    
    site_data = random.choice(test_data)
    add_password(driver, site_data)
    
    delete_button = driver.find_element(By.XPATH, "//button[text()='Delete']")
    delete_button.click()
    
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert site_data["website"] not in bodyText


def test_export_passwords(setup):
    driver = setup

    with open('test_data.json', 'r') as f:
        site_data = json.load(f)[:2]

    for site in site_data: add_password(driver, site)
    
    export_link = driver.find_element(By.ID, "exportPasswords")
    export_link.click()
    
    # Update this to your browser's default download directory
    download_dir = "/Users/anish/Downloads"
    filename = "test_" + str(random.randint(1, 100))
    file_path = os.path.join(download_dir, filename)
    
    filename_input = driver.find_element(By.ID, "outputFile")
    filename_input.send_keys(filename)

    export_button = driver.find_element(By.XPATH, "//button[text()='Export']")
    export_button.click()
    
    bodyText = driver.find_element(By.TAG_NAME, 'body').text
    assert f"Download File: {filename}.csv" in bodyText

    validate_csv(driver, file_path + ".csv", site_data)


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
