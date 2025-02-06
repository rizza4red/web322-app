const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];


const initialize = () => {
  return new Promise((resolve, reject) => {
    const itemsFilePath = path.join(process.cwd(), "data", "items.json");
    const categoriesFilePath = path.join(process.cwd(), "data", "categories.json");

    console.log("Items file path:", itemsFilePath);
    console.log("Categories file path:", categoriesFilePath);

    fs.readFile(itemsFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading items file:", err);
        return reject("Unable to read items file");
      }

      try {
        items = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing items.json:", error);
        return reject("Error parsing items.json");
      }

      fs.readFile(categoriesFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading categories file:", err);
          return reject("Unable to read categories file");
        }

        try {
          categories = JSON.parse(data);
        } catch (error) {
          console.error("Error parsing categories.json:", error);
          return reject("Error parsing categories.json");
        }

        console.log("Initialization complete. Items and categories loaded.");
        resolve();
      });
    });
  });
};

const getAllItems = () =>
  new Promise((resolve, reject) => {
    items.length > 0 ? resolve(items) : reject("No results returned");
  });


const getPublishedItems = () =>
  new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published);
    publishedItems.length > 0
      ? resolve(publishedItems)
      : reject("No published items available");
  });


const getCategories = () =>
  new Promise((resolve, reject) => {
    categories.length > 0
      ? resolve(categories)
      : reject("No categories available");
  });

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
};
