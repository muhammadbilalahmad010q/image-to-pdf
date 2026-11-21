
const imageInput = document.getElementById("imageInput");
const previewSection = document.getElementById("previewSection");
const previewContainer = document.getElementById("previewContainer");
const convertBtn = document.getElementById("convertBtn");
const uploadBox = document.querySelector(".upload-box");

let selectedImages = [];

// =========================
// HANDLE SELECTED FILES
// =========================

function handleFiles(files) {
    Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
            return;
        }

        const imageURL = URL.createObjectURL(file);

        selectedImages.push({
            file: file,
            url: imageURL
        });
    });

    displayImages();
}


// =========================
// FILE PICKER
// =========================

imageInput.addEventListener("change", function () {
    handleFiles(imageInput.files);

    // Reset input so the same image can be selected again
    imageInput.value = "";
});


// =========================
// DISPLAY IMAGE PREVIEWS
// =========================

function displayImages() {
    previewContainer.innerHTML = "";

    if (selectedImages.length === 0) {
        previewSection.style.display = "none";
        return;
    }

    previewSection.style.display = "block";

    selectedImages.forEach((image, index) => {

        // Create preview card
        const card = document.createElement("div");
        card.classList.add("preview-card");

        // Create image
        const img = document.createElement("img");
        img.src = image.url;
        img.alt = image.file.name;

        // Create file name
        const fileName = document.createElement("p");
        fileName.textContent = image.file.name;

        // Create remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("remove-btn");

        // Remove image
        removeButton.addEventListener("click", function () {

            URL.revokeObjectURL(selectedImages[index].url);

            selectedImages.splice(index, 1);

            displayImages();
        });

        // Add elements to card
        card.appendChild(img);
        card.appendChild(fileName);
        card.appendChild(removeButton);

        // Add card to preview container
        previewContainer.appendChild(card);
    });
}


// =========================
// DRAG AND DROP
// =========================

// Prevent browser from opening dragged files
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {

    uploadBox.addEventListener(eventName, function (event) {
        event.preventDefault();
    });

});


// Highlight upload area
uploadBox.addEventListener("dragover", function () {
    uploadBox.classList.add("drag-over");
});


// Remove highlight
uploadBox.addEventListener("dragleave", function () {
    uploadBox.classList.remove("drag-over");
});


// Handle dropped files
uploadBox.addEventListener("drop", function (event) {

    uploadBox.classList.remove("drag-over");

    const files = event.dataTransfer.files;

    handleFiles(files);
});


// =========================
// CONVERT IMAGES TO PDF
// =========================

convertBtn.addEventListener("click", async function () {

    // Check if images are selected
    if (selectedImages.length === 0) {
        alert("Please select images first!");
        return;
    }

    // Create FormData
    const formData = new FormData();

    // Add selected images to FormData
    selectedImages.forEach((image) => {
        formData.append("images", image.file);
    });

    try {

        // Send images to server
        const response = await fetch("/convert", {
            method: "POST",
            body: formData
        });

        // If server returns an error
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "PDF conversion failed");
        }

        // Receive PDF file
        const blob = await response.blob();

        // Create download URL
        const pdfURL = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = pdfURL;
        link.download = "converted-images.pdf";

        // Download PDF
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Release the PDF URL after download starts
        setTimeout(() => {
            URL.revokeObjectURL(pdfURL);
        }, 1000);

    } catch (error) {

        console.error("Error:", error);

        alert("Conversion failed: " + error.message);
    }
});
