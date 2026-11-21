const { PDFDocument } = require("pdf-lib");
const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Convert images to PDF
app.post("/convert", upload.array("images"), async (req, res) => {
    try {
        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No images were uploaded.");
        }

        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        console.log("Total images received:", req.files.length);

        // For now, use only the first uploaded image
       // Process all uploaded images
for (const image of req.files) {
    

    let embeddedImage;

    if (image.mimetype === "image/png") {
        embeddedImage = await pdfDoc.embedPng(image.buffer);
    } else if (image.mimetype === "image/jpeg") {
        embeddedImage = await pdfDoc.embedJpg(image.buffer);
    } else {
        return res.status(400).send("Only JPG and PNG images are supported.");
    }

    const page = pdfDoc.addPage([600, 800]);

    const imageDimensions = embeddedImage.scale(1);

    const scale = Math.min(
        600 / imageDimensions.width,
        800 / imageDimensions.height
    );

    page.drawImage(embeddedImage, {
        x: (600 - imageDimensions.width * scale) / 2,
        y: (800 - imageDimensions.height * scale) / 2,
        width: imageDimensions.width * scale,
        height: imageDimensions.height * scale
    });
}

        // Save PDF
        const pdfBytes = await pdfDoc.save();

        // Debug information
        console.log("PDF size:", pdfBytes.length);
        console.log(
            "PDF signature:",
            Buffer.from(pdfBytes).subarray(0, 5).toString()
        );

        // Send PDF to browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");

        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("PDF conversion error:", error);
        res.status(500).send("Failed to convert images to PDF.");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});