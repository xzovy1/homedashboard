const express = require("express");
const groceryRouter = express.Router();
const groceryController = require("../controllers/groceryController");

// Items & Categories Management
groceryRouter.post("/searchItem", groceryController.searchItem);

groceryRouter.get("/items", groceryController.getItems);
groceryRouter.post("/createItem", groceryController.createItem);
groceryRouter.put("/item/:id", groceryController.updateItem);
groceryRouter.delete("/item/:id", groceryController.deleteItem);

groceryRouter.get("/list", groceryController.getListItems);
groceryRouter.post("/list", groceryController.addListItem);
groceryRouter.put("/list/:id", groceryController.updateListItem);
groceryRouter.delete("/list/:id", groceryController.deleteListItem);

groceryRouter.get("/categories", groceryController.getCategories);
groceryRouter.post("/createCategory", groceryController.createCategory);
groceryRouter.put("/updateCategory", groceryController.updateCategory);
groceryRouter.delete("/deleteCategory", groceryController.deleteCategory);

// Shopping Cart View
groceryRouter.get("/cart", groceryController.getCartItems);
groceryRouter.post("/cart/:itemId", groceryController.addToCart);
groceryRouter.post("/checkout", groceryController.checkoutItems);
groceryRouter.post(
  "/cart/returnToList/:itemId",
  groceryController.returnItemToList,
);

// Store Management
// groceryRouter.get("/stores", groceryController.getStores);
// groceryRouter.post("/stores", groceryController.createStore);

module.exports = groceryRouter;
