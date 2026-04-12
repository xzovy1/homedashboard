const db = require("../db/queries/groceryQueries.js");
const Error = require("../errors.js");
const groceryController = {};

//items
groceryController.createItem = async (req, res) => {
  if (!req.body) throw new Error.CustomBadRequestError("Body Malformed");
  const { name, categoryId, details, price_estimate, quantity, saveToDB } =
    req.body;
  if (!name || !categoryId)
    throw new Error.CustomBadRequestError("Missing Required Fields");
  const createdItem = await db.createItem(
    name.toLowerCase(),
    categoryId,
    details,
    price_estimate,
    quantity,
    saveToDB,
  );
  if (!createdItem)
    throw new Error.CustomInternalError("DB Error/Item Not Created");
  res.status(201).json(createdItem);
};

groceryController.getItems = async (req, res) => {
  const items = await db.getAllItems();
  res.status(200).json(items);
};

groceryController.searchItem = async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query != "string") return;
  //causing error on empty search string
  // throw new Error.CustomBadRequestError("Search Query is required");

  const items = await db.searchItem(query.toLowerCase());
  if (!items) throw new Error.CustomInternalError("Search failed");

  res.json(items);
};

groceryController.updateItem = async (req, res) => {
  const id = req.params.id;
  const { name, categoryId, details, price_estimate, quantity } = req.body;
  console.log(req.body);
  const createdItem = await db.updateItem(
    name,
    categoryId,
    id,
    details,
    quantity,
    price_estimate,
  );
  res.status(200).json(createdItem);
};

groceryController.deleteItem = async (req, res) => {
  const { id } = req.params;
  const deletedItem = await db.deleteItem(id);
  if (!deletedItem) throw new Error.CustomNotFoundError("Item not found");
  res.status(204).end();
};

//shopping_list
groceryController.getListItems = async (req, res) => {
  const items = await db.getListItems();
  res.json(items);
};

groceryController.addListItem = async (req, res) => {
  const newItem = await db.addItemToList(req.body);
  res.status(201).json(newItem);
};

groceryController.updateListItem = async (req, res) => {
  const updated = await db.updateListItem(req.params.id, req.body.quantity);
  if (!updated) throw new Error.CustomNotFoundError("Item not found");
  res.status(200).json(updated);
};

groceryController.deleteListItem = async (req, res) => {
  await db.deleteListItem(req.params.id);
  res.status(204).end();
};

//shopping_cart
groceryController.getCartItems = async (req, res) => {
  const cartItems = await db.getCartItems();
  res.json(cartItems);
};

groceryController.addToCart = async (req, res) => {
  const { itemId } = req.params;
  if (!itemId) throw new Error.CustomNotFoundError("Malformed Request");
  const item = await db.addToCart(itemId);
  if (!item) throw new Error.CustomNotFoundError("Item not found");
  res.status(201).json(item);
};

groceryController.returnItemToList = async (req, res) => {
  const { itemId } = req.params;
  await db.returnItemToList(itemId);
  res.status(204).end();
};

groceryController.checkoutItems = async (req, res) => {
  await db.checkoutItems();
  res.json({ message: "Checkout successful" });
};

//categories
groceryController.getCategories = async (req, res) => {
  const categories = await db.getCategories();
  res.status(200).json(categories);
};

groceryController.createCategory = async (req, res) => {
  const category = await db.createCategory(req.body.name);
  res.status(201).json(category);
};

groceryController.updateCategory = async (req, res) => {
  const updated = await db.updateCategory(req.params.id, req.body.name);
  res.json(updated);
};

groceryController.deleteCategory = async (req, res) => {
  await db.deleteCategory(req.params.id);
  res.status(204).end();
};

//stores
groceryController.getStores = async (req, res) => {
  const stores = await db.getStores();
  res.status(200).json(stores);
};

groceryController.createStore = async (req, res) => {
  const store = await db.createStore(req.body.name);
  res.status(201).json(store);
};

groceryController.updateStore = async (req, res) => {
  const updated = await db.updateStore(req.params.id, req.body.name);
  res.json(updated);
};

groceryController.deleteStore = async (req, res) => {
  await db.deleteStore(req.params.id);
  res.status(204).end();
};

module.exports = groceryController;
