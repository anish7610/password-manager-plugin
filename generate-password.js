import { copyToClipboard } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {
    const generatePasswordForm = document.getElementById("generatePasswordForm");

    generatePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();
        generatePassword();
    });
});

function generatePassword() {
    var length = document.getElementById("passwordLength").value;
    var includeUppercase = document.getElementById("includeUppercase").checked;
    var includeNumbers = document.getElementById("includeNumbers").checked;
    var includeSymbols = document.getElementById("includeSymbols").checked;
    var charset = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    var password = "";
    for (var i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    var generatedPassword = document.getElementById("generatedPassword")
    generatedPassword.innerText = password;

    const copyToClipboardButton = document.createElement('button');
    copyToClipboardButton.textContent = 'Copy';
    copyToClipboardButton.style.marginLeft = '10px';
    generatedPassword.appendChild(copyToClipboardButton);

    copyToClipboardButton.addEventListener('click', function(event) {
        // Get the text content of the h2 element
        var textToCopy = document.getElementById("generatedPassword").innerText.split('Copy')[0];
        copyToClipboard(textToCopy);
    });
}