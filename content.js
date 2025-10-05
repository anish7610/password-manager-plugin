const DEFAULT_USERNAME = 'input[type="password"][name="username"]'
const DEFAULT_EMAIL = 'input[type="email"][name="email"]'
const DEFAULT_PASSWORD = 'input[type="password"][name="password"]'
const LINKEDIN_USERNAME = 'input[type="text"][name="session_key"]'
const LINKEDIN_PASSWORD = 'input[type="password"][name="session_password"]'
const GMAIL_EMAIL = 'input[type="email"][name="identifier"]'
const GMAIL_PASSWORD = 'input[type="password"][name="Passwd"]'
const FACEBOOK_EMAIL = 'input[type="text"][name="email"]'
const FACEBOOK_PASSWORD = 'input[type="password"][name="pass"]'
const NETFLIX_EMAIL = 'input[type="email"][name="userLoginId"]'
const HULU_EMAIL = 'input[type="text"][data-automationid="email-field"]'
const HULU_PASSWORD = 'input[type="password"][data-automationid="password-field"]'

const RENTCAFE_USERNAME = 'input[type="text"][name="Username"]'
const RENTCAFE_PASSWORD = 'input[type="password"][name="Password"]'


function autofillCredentials(usernameSelector, passwordSelector, username, password) {
    var usernameField = document.querySelector(usernameSelector);
    var passwordField = document.querySelector(passwordSelector);

    if (usernameField) {
      // Set the username and password values
      usernameField.value = username;
    }

    if (passwordField) {
      passwordField.value = password;
    }
  }


// Message listener to receive messages from the extension popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'autofill') {
        var title = message.title;
        switch(true) {
          case title.indexOf('LinkedIn') !== -1:
            usernameSelector = LINKEDIN_USERNAME;
            passwordSelector = LINKEDIN_PASSWORD;
            break;
          case title.indexOf('Facebook') !== -1:
            usernameSelector = FACEBOOK_EMAIL;
            passwordSelector = FACEBOOK_PASSWORD;
            break;
          case title.indexOf('Netflix') !== -1:
            usernameSelector = NETFLIX_EMAIL;
            passwordSelector = DEFAULT_PASSWORD;
            break;
          case title.indexOf('Hulu') !== -1:
              usernameSelector = HULU_EMAIL;
              passwordSelector = HULU_PASSWORD;
              break;
          case title.indexOf('Gmail') !== -1:
            usernameSelector = GMAIL_EMAIL;
            passwordSelector = GMAIL_PASSWORD;
            break;
          case title.indexOf('RentCafe') !== -1:
            usernameSelector = RENTCAFE_USERNAME;
            passwordSelector = RENTCAFE_PASSWORD;
            break;
          default:
            usernameSelector = DEFAULT_EMAIL;
            passwordSelector = DEFAULT_PASSWORD;
        }
        autofillCredentials(usernameSelector, passwordSelector, message.username, message.password);
    }
});
