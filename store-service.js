const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(process.cwd(), "data", "items.json"), "utf8", (err, data) => {
            if (err) return reject("Unable to read items file");
            try {
                items = JSON.parse(data);
            } catch (error) {
                return reject("Error parsing items.json");
            }

            fs.readFile(path.join(process.cwd(), "data", "categories.json"), "utf8", (err, data) => {
                if (err) return reject("Unable to read categories file");
                try {
                    categories = JSON.parse(data);
                } catch (error) {
                    return reject("Error parsing categories.json");
                }
                resolve();
            });
        });
    });
};

const getAllItems = () => {
    return new Promise((resolve, reject) => {
        items.length > 0 ? resolve(items) : reject("No items found");
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        publishedItems.length > 0 ? resolve(publishedItems) : reject("No published items available");
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        categories.length > 0 ? resolve(categories) : reject("No categories available");
    });
};

const addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        itemData.postDate = new Date().toISOString().split("T")[0];
        itemData.category = parseInt(itemData.category);

        items.push(itemData);


        fs.writeFile(
            path.join(process.cwd(), "data", "items.json"),
            JSON.stringify(items, null, 4),
            (err) => {
                if (err) {
                    console.error("Error saving item:", err);
                    return reject("Unable to save item.");
                }
                console.log("✅ Item saved to items.json:", itemData); 
                resolve(itemData);
            }
        );
    });
};


const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        filteredItems.length > 0 ? resolve(filteredItems) : reject("No items found for this category");
    });
};

const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        filteredItems.length > 0 ? resolve(filteredItems) : reject("No items found after this date");
    });
};

const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        item ? resolve(item) : reject("No item found with this ID");
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};