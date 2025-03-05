/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Rizza Salvador  
*  Student ID: 150401230  
*  Date: March 4, 2025
*  Render Web App URL: https://web322-app-dbb2.onrender.com
*  GitHub Repository URL: https://github.com/rizza4red/web322-app
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

app.get("/", (req, res) => res.redirect("/about"));
app.get("/about", (req, res) => res.sendFile(__dirname + "/views/about.html"));
app.get("/shop", (req, res) => res.sendFile(__dirname + "/views/shop.html"));
app.get("/items", (req, res) => res.sendFile(__dirname + "/views/items.html"));
app.get("/categories", (req, res) => res.sendFile(__dirname + "/views/categories.html"));
app.get("/items/add", (req, res) => res.sendFile(__dirname + "/views/addItem.html"));

app.get("/api/items", async (req, res) => {
    let { category, minDate } = req.query;

    try {
        let items = await storeService.getAllItems();

        if (category) {
            items = items.filter(item => item.category == category);
        }

        if (minDate) {
            let filterDate = new Date(minDate).setHours(0, 0, 0, 0);
            items = items.filter(item => new Date(item.postDate).setHours(0, 0, 0, 0) >= filterDate);
        }

        items.length > 0 ? res.json(items) : res.status(404).json({ message: "No items match the filters" });
    } catch (err) {
        console.error("Error in /api/items:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/item/:id", async (req, res) => {
    try {
        let item = await storeService.getItemById(req.params.id);
        res.json(item);
    } catch (err) {
        console.error(`Error in /api/item/${req.params.id}:`, err);
        res.status(404).json({ message: "No result found" });
    }
});

app.get("/api/items/published", async (req, res) => {
    try {
        let items = await storeService.getPublishedItems();
        res.json(items);
    } catch (err) {
        console.error("Error in /api/items/published:", err);
        res.status(404).json({ message: "No published items available" });
    }
});

app.get("/api/categories", async (req, res) => {
    try {
        let categories = await storeService.getCategories();
        res.json(categories);
    } catch (err) {
        console.error("Error in /api/categories:", err);
        res.status(404).json({ message: "No categories available" });
    }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    try {
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

            let uploaded = await streamUpload(req);
            req.body.featureImage = uploaded.url;
        } else {
            req.body.featureImage = "";
        }

        await storeService.addItem(req.body);
        res.redirect("/items");
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ error: "Unable to add item" });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`❌ Failed to start server: ${err}`);
        process.exit(1);
    });