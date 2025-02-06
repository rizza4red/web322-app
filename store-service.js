const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "data", "items.json"), "utf8", (err, data) => {
            if (err) return reject("Unable to read items file");

            try {
                items = JSON.parse(data);
            } catch (error) {
                return reject("Error parsing items.json");
            }

            fs.readFile(path.join(__dirname, "data", "categories.json"), "utf8", (err, data) => {
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
