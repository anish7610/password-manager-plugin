import { exportPasswords, toggleVisibility } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {
    const exportForm = document.getElementById("exportForm");
    const filename = document.getElementById("outputFile");
    const spanText = document.getElementById("spanText");

    exportForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (spanText.style.display != "none") {
            toggleVisibility(spanText);
        }

        exportPasswords(filename.value);
    });
});