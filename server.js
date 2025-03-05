/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Rizza Salvador  
*  Student ID: 150401230  
*  Date: [INSERT DATE]
*  Cyclic Web App URL: [INSERT URL]
*  GitHub Repository URL: [INSERT URL]
**********************************************************************************/

const express = require("express");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: "dupzz5jsk",
    api_key: "294379793524562",
    api_secret: "uiNnDG8KQVkHpw0qMAGCouh6Etg",
    secure: true
});

const upload = multer();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Serve Static Pages
app.get("/", (req, res) => res.redirect("/about"));
app.get("/about", (req, res) => res.sendFile(__dirname + "/views/about.html"));
app.get("/shop", (req, res) => res.sendFile(__dirname + "/views/shop.html"));
app.get("/items", (req, res) => res.sendFile(__dirname + "/views/items.html"));
app.get("/categories", (req, res) => res.sendFile(__dirname + "/views/categories.html"));
app.get("/items/add", (req, res) => res.sendFile(__dirname + "/views/addItem.html"));

// API Routes
app.get("/api/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(data => res.json(data))
            .catch(err => {
                console.error("Error in /api/items?category:", err);
                res.status(500).json({ message: err });
            });
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(data => res.json(data))
            .catch(err => {
                console.error("Error in /api/items?minDate:", err);
                res.status(500).json({ message: err });
            });
    } else {
        storeService.getAllItems()
            .then(data => res.json(data))
            .catch(err => {
                console.error("Error in /api/items:", err);
                res.status(500).json({ message: "No items available" });
            });
    }
});

app.get("/api/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(data => res.json(data))
        .catch(err => {
            console.error(`Error in /api/item/${req.params.id}:`, err);
            res.status(500).json({ message: "No result found" });
        });
});

app.get("/api/items/published", (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => {
            console.error("Error in /api/items/published:", err);
            res.status(500).json({ message: "No published items available" });
        });
});

app.get("/api/categories", (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => {
            console.error("Error in /api/categories:", err);
            res.status(500).json({ message: "No categories available" });
        });
});

// Add New Item (POST Request)
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function uploadImage(req) {
            let result = await streamUpload(req);
            return result;
        }

        uploadImage(req)
            .then((uploaded) => processItem(uploaded.url))
            .catch(err => {
                console.error("Error uploading image:", err);
                processItem("");
            });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => {
                console.error("Error adding item:", err);
                res.status(500).json({ error: err });
            });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});

// Initialize Store Service
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`Failed to start server: ${err}`);
        process.exit(1);
    });
