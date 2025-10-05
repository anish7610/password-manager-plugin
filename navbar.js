function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("navbarContainer").innerHTML = html;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

document.addEventListener('click', function(event) {
    let page;
    if (event.target && event.target.matches('.navbar-item')) {
        switch(event.target.id) {
            case "home":
                page = "view-passwords.html";
                break;
            case "generatePassword":
                page = "generate-password.html";
                break;
            case "exportPasswords":
                page = "export.html";
                break;
            case "importPasswords":
                page = "import.html";
                break;
            case "logout":
                chrome.storage.local.set({isLoggedIn: false, username: ''})
                page = "login.html";
                break;
        }
        if (page) {
            window.location.href = page;
        }
    }
});

window.onload = function() {
    loadNavbar();
};
