/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Rizza Salvador  
*  Student ID: 150401230  
*  Date: February 5, 2025
*  Replit Web App URL:  https://replit.com/@rizza4red/web322-app
*  GitHub Repository URL: https://github.com/rizza4red/web322-app
**********************************************************************************/

const express = require("express");
const storeService = require("./store-service");
const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.static("public"));


app.get("/", (req, res) => res.redirect("/about"));


app.get("/about", (req, res) => res.sendFile(__dirname + "/views/about.html"));
app.get("/shop", (req, res) => res.sendFile(__dirname + "/views/shop.html"));
app.get("/items", (req, res) => res.sendFile(__dirname + "/views/items.html"));
app.get("/categories", (req, res) => res.sendFile(__dirname + "/views/categories.html"));


app.get("/api/items", (req, res) => {
    storeService.getAllItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: "No items available" }));
});

app.get("/api/items/published", (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: "No published items available" }));
});

app.get("/api/categories", (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: "No categories available" }));
});


app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});


storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`Failed to start server: ${err}`);
        process.exit(1);
    });
