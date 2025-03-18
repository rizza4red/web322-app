/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Rizza Salvador  
*  Student ID: 150401230  
*  Date: March 18, 2025
*  Render Web App URL: https://web322-app-dbb2.onrender.com
*  GitHub Repository URL: https://github.com/rizza4red/web322-app
**********************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();
const PORT = process.env.PORT || 8080;

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        equal: (a, b) => a == b
    }
}));

app.set("view engine", ".hbs");

cloudinary.config({
    cloud_name: "dupzz5jsk",
    api_key: "294379793524562",
    api_secret: "uiNnDG8KQVkHpw0qMAGCouh6Etg",
    secure: true
});

const upload = multer();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (req, res) => res.redirect("/shop"));

app.get("/about", (req, res) => res.render("about"));

app.get("/shop", async (req, res) => {
    try {
        let items = await storeService.getPublishedItems();
        res.render("shop", { items });
    } catch {
        res.render("shop", { message: "No published items available" });
    }
});

app.get("/items", async (req, res) => {
    try {
        let { category, minDate } = req.query;
        let items = await storeService.getAllItems();
        let categories = await storeService.getCategories();

        if (category) {
            items = items.filter(item => item.category == category);
        }
        if (minDate) {
            let filterDate = new Date(minDate).setHours(0, 0, 0, 0);
            items = items.filter(item => new Date(item.postDate).setHours(0, 0, 0, 0) >= filterDate);
        }

        res.render("items", { 
            items, 
            categories, 
            selectedCategory: category || "", 
            selectedMinDate: minDate || "" 
        });
    } catch {
        res.render("items", { message: "No results found" });
    }
});

app.get("/categories", async (req, res) => {
    try {
        let categories = await storeService.getCategories();
        res.render("categories", { categories });
    } catch {
        res.render("categories", { message: "No categories available" });
    }
});

app.get("/items/add", (req, res) => res.render("addItem"));

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
    res.status(404).render("404");
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`❌ Failed to start server: ${err}`);
        process.exit(1);
    });
