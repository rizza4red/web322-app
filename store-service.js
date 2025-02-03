const fs = require("fs");

let items = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) return reject("Unable to read items file");
            
            try {
                items = JSON.parse(data);
            } catch (error) {
                return reject("Error parsing items.json");
            }

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
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

const getAllItems = () => new Promise((resolve, reject) => {
    items.length > 0 ? resolve(items) : reject("No results returned");
});

const getPublishedItems = () => new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    publishedItems.length > 0 ? resolve(publishedItems) : reject("No published items available");
});

const getCategories = () => new Promise((resolve, reject) => {
    categories.length > 0 ? resolve(categories) : reject("No categories available");
});

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
