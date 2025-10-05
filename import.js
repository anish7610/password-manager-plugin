import { importPasswords } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function(event) {
        event.preventDefault();
        const file = event.target.files[0];

        importPasswords(file);
    });
});