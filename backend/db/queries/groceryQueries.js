const pool = require("../pool");

//items
exports.getAllItems = async () => {
  const { rows } = await pool.query("SELECT * FROM items;");
  return rows;
};

exports.searchItem = async (query) => {
  const { rows } = await pool.query(
    `
    SELECT items.id, items.name, items.category_id AS category_id, categories.name AS category_name FROM items 
    LEFT JOIN categories ON items.category_id = categories.id 
    WHERE items.name LIKE $1
    `,
    [`%${query}%`],
  );
  return rows;
};

exports.createItem = async (
  name,
  categoryId,
  details,
  price_estimate,
  quantity,
  saveToDB,
) => {
  await pool.query("BEGIN");
  try {
    const { rows } = await pool.query(
      `
      WITH inserted_item AS (
        INSERT INTO items (name, category_id, details, price_estimate, quantity, save_item) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      ),
      inserted_history AS (
        INSERT INTO item_data (item_id, times_purchased, last_purchase) 
        SELECT id, 0, NULL FROM inserted_item
      )
      SELECT ii.name, ii.id, c.name AS category_name, c.id AS category_id, price_estimate, details, quantity
      FROM inserted_item ii
      LEFT JOIN categories c ON ii.category_id = c.id;
      `,
      [name, categoryId, details, price_estimate, quantity, saveToDB],
    );
    await pool.query("COMMIT");
    return rows[0];
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
};

exports.updateItem = async (
  name,
  categoryId,
  id,
  details,
  quantity,
  price_estimate,
) => {
  const { rows } = await pool.query(
    "UPDATE items SET name = $1, category_id = $2, details = $3, quantity = $4, price_estimate = $5 WHERE id = $6 RETURNING *",
    [name, categoryId, details, quantity, price_estimate, id],
  );
  return rows[0];
};

exports.deleteItem = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM items WHERE id = $1 RETURNING *",
    [id],
  );
  return rows[0];
};

//list
exports.getListItems = async () => {
  const { rows } = await pool.query(
    `
     SELECT sl.id, i.name, i.id, c.id category_id, c.name category_name, i.details, i.price_estimate, i.quantity
     FROM shopping_list sl 
     LEFT JOIN items i ON sl.item_id = i.id
     LEFT JOIN categories c ON c.id = i.category_id
     ORDER BY c.id
     ; 
     `,
  );
  return rows;
};

exports.addItemToList = async (item) => {
  const { rows } = await pool.query(
    "INSERT INTO shopping_list (item_id) VALUES ($1) RETURNING *",
    [item.id],
  );
  return rows[0];
};

exports.updateListItem = async (id, quantity) => {
  const { rows } = await pool.query(
    "UPDATE shopping_list SET quantity = $1 WHERE id = $2 RETURNING *",
    [quantity, id],
  );
  return rows[0];
};

exports.deleteListItem = async (id) => {
  await pool.query("DELETE FROM shopping_list WHERE item_id = $1", [id]);
};

//cart
exports.addToCart = async (itemId) => {
  await pool.query("BEGIN");
  try {
    // console.log((await pool.query(`SELECT * FROM shopping_list;`)).rows);
    const { rows } = await pool.query(
      `
      INSERT INTO cart_items (item_id) 
      VALUES ($1)
      ON CONFLICT (item_id)
      DO NOTHING
      RETURNING *`,
      [itemId],
    );
    await pool.query("DELETE FROM shopping_list WHERE item_id = $1", [itemId]);
    await pool.query("COMMIT");
    return rows[0];
  } catch (e) {
    await pool.query("ROLLBACK");
    // throw new Error(e);
  }
};

exports.returnItemToList = async (itemId) => {
  await pool.query("BEGIN");
  try {
    await pool.query(
      "INSERT INTO shopping_list (item_id) VALUES ($1) RETURNING *;",
      [itemId],
    );
    await pool.query("DELETE FROM cart_items WHERE item_id = $1", [itemId]);
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw new Error(e);
  }
};

exports.getCartItems = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM cart_items LEFT JOIN items ON cart_items.item_id = items.id",
  );
  return rows;
};

exports.checkoutItems = async () => {
  await pool.query("BEGIN");
  try {
    // Update item_data in a single query: increment quantity by the count of each item in cart_items
    await pool.query(`
      WITH
      cte_item_data AS (
        UPDATE item_data
        SET times_purchased = item_data.times_purchased + sub.count, last_purchase = NOW()
        FROM (
          SELECT cart_items.item_id, COUNT(*) AS count
          FROM cart_items
          GROUP BY cart_items.item_id
          ) AS sub
          WHERE item_data.item_id = sub.item_id
          RETURNING item_data.item_id
        ),
        cte_purchase_history AS (
          INSERT INTO purchase_history (item_id, purchase_date) SELECT cte_item_data.item_id, NOW() FROM cte_item_data
        ),
        cte_remove_unsaved AS (
            DELETE FROM items 
            WHERE id = (
              SELECT item_id FROM cart_items LEFT JOIN items ON cart_items.item_id = items.id WHERE save_item IS NOT TRUE
            )
        )
      SELECT 1
    `);

    // Clear the cart
    await pool.query("TRUNCATE cart_items;");
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw new Error(e);
  }
};

//categories
exports.getCategories = async () => {
  const { rows } = await pool.query("SELECT * FROM categories;");
  return rows;
};

exports.createCategory = async (name) => {
  const { rows } = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name],
  );
  return rows[0];
};

exports.updateCategory = async (id, name) => {
  const { rows } = await pool.query(
    "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
    [name, id],
  );
  return rows[0];
};

exports.deleteCategory = async (id) => {
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
};

//stores
exports.getStores = async (name) => {
  const { rows } = await pool.query("SELECT * FROM stores;");
  return rows;
};

exports.createStore = async (name) => {
  const { rows } = await pool.query(
    "INSERT INTO stores (name) VALUES ($1) RETURNING *",
    [name],
  );
  return rows[0];
};

exports.updateStore = async (id, name) => {
  const { rows } = await pool.query(
    "UPDATE stores SET name = $1 WHERE id = $2 RETURNING *",
    [name, id],
  );
  return rows[0];
};

exports.deleteCategory = async (id) => {
  await pool.query("DELETE FROM stores WHERE id = $1", [id]);
};
