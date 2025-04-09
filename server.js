/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Rizza Salvador  
*  Student ID: 150401230  
*  Date: April 8, 2025
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

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.locals.formatDate = function (dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    let day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

cloudinary.config({
    cloud_name: "dupzz5jsk",
    api_key: "294379793524562",
    api_secret: "uiNnDG8KQVkHpw0qMAGCouh6Etg",
    secure: true
});
const upload = multer();

app.get("/", (req, res) => res.redirect("/about"));

app.get("/about", (req, res) => {
    res.render("about", { title: "About", active: "about" });
});

app.get("/shop", async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        res.render("shop", { title: "Shop", active: "shop", items });
    } catch {
        res.render("shop", { title: "Shop", active: "shop", items: [] });
    }
});

app.get("/items", async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        const categories = await storeService.getCategories();
        res.render("items", { title: "Items", active: "items", items, categories });
    } catch {
        res.render("items", { title: "Items", active: "items", items: [], categories: [], message: "No results" });
    }
});

app.get("/items/add", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("addItem", { title: "Add Item", active: "add", categories });
    } catch {
        res.render("addItem", { title: "Add Item", active: "add", categories: [] });
    }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    try {
        if (req.file) {
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };
            const uploaded = await streamUpload(req);
            req.body.featureImage = uploaded.url;
        } else {
            req.body.featureImage = "";
        }
        await storeService.addItem(req.body);
        res.redirect("/items");
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).send("Unable to add item.");
    }
});

app.get("/items/delete/:id", async (req, res) => {
    try {
        await storeService.deletePostById(req.params.id);
        res.redirect("/items");
    } catch {
        res.status(500).send("Unable to Remove Post / Post not found");
    }
});

app.get("/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("categories", { title: "Categories", active: "categories", categories });
    } catch {
        res.render("categories", { title: "Categories", active: "categories", categories: [], message: "No results" });
    }
});

app.get("/categories/add", (req, res) => {
    res.render("addCategory", { title: "Add Category", active: "categories" });
});

app.post("/categories/add", async (req, res) => {
    try {
        await storeService.addCategory(req.body);
        res.redirect("/categories");
    } catch (err) {
        console.error("Error adding category:", err);
        res.status(500).send("Unable to add category.");
    }
});

app.get("/categories/delete/:id", async (req, res) => {
    try {
        await storeService.deleteCategoryById(req.params.id);
        res.redirect("/categories");
    } catch {
        res.status(500).send("Unable to Remove Category / Category not found");
    }
});

app.get("/api/items", async (req, res) => {
    const { category, minDate } = req.query;
    try {
        let items = await storeService.getAllItems();
        if (category) items = items.filter(item => item.category == category);
        if (minDate) {
            const filterDate = new Date(minDate).setHours(0, 0, 0, 0);
            items = items.filter(item => new Date(item.postDate).setHours(0, 0, 0, 0) >= filterDate);
        }
        items.length ? res.json(items) : res.status(404).json({ message: "No items match the filters" });
    } catch (err) {
        console.error("Error in /api/items:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/item/:id", async (req, res) => {
    try {
        const item = await storeService.getItemById(req.params.id);
        res.json(item);
    } catch {
        res.status(404).json({ message: "No result found" });
    }
});

app.get("/api/items/published", async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        res.json(items);
    } catch {
        res.status(404).json({ message: "No published items available" });
    }
});

app.get("/api/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.json(categories);
    } catch {
        res.status(404).json({ message: "No categories available" });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { title: "404 - Not Found", active: "" });
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`❌ Failed to start server: ${err}`);
        process.exit(1);
    });
