const Sequelize = require('sequelize');

const sequelize = new Sequelize('railway', 'postgres', 'IfDPlUnQCwqBniNSsSAOArizJZlMbjxB', {
    host: 'yamanote.proxy.rlwy.net',
    dialect: 'postgres',
    port: 24489,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    query: { raw: true }
});



// Define Models
const Item = sequelize.define("Item", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define("Category", {
    category: Sequelize.STRING
});

// Associations
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize DB
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("Unable to sync the database"));
    });
}

// Get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

// Get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

// Get items by minimum date
function getItemsByMinDate(minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

// Get item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id } })
            .then(data => resolve(data[0]))
            .catch(() => reject("no results returned"));
    });
}

// Add item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;

        // Replace empty strings with null
        for (let prop in itemData) {
            if (itemData[prop] === "") itemData[prop] = null;
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => resolve())
            .catch(() => reject("unable to create post"));
    });
}

// Get published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

// Get published items by category
function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category } })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

// Get categories
function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

// Add category
function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") categoryData[prop] = null;
        }

        Category.create(categoryData)
            .then(() => resolve())
            .catch(() => reject("unable to create category"));
    });
}

// Delete category by ID
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id } })
            .then(rowsDeleted => {
                rowsDeleted > 0 ? resolve() : reject("Category not found");
            })
            .catch(() => reject("unable to delete category"));
    });
}

// Delete item by ID
function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id } })
            .then(rowsDeleted => {
                rowsDeleted > 0 ? resolve() : reject("Post not found");
            })
            .catch(() => reject("unable to delete post"));
    });
}

module.exports = {
    initialize,
    getAllItems,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
    getPublishedItems,
    getPublishedItemsByCategory,
    getCategories,
    addCategory,
    deleteCategoryById,
    deletePostById
};
