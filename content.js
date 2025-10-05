// content.js
function autofillCredentials(username, password) {
    var usernameField = document.querySelector('input[type="email"][name="email"]');
    var passwordField = document.querySelector('input[type="password"][name="password"]');
    if (usernameField && passwordField) {
      // Set the username and password values
      usernameField.value = username;
      passwordField.value = password;
    }
  }


// Message listener to receive messages from the extension popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'autofill') {
        autofillCredentials(message.username, message.password);
    }
});
