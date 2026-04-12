const request = require("supertest");
require("jest");

const app = require("../app");

const fs = require("node:fs");
const path = require("node:path");
const sqlFilePath = path.join(__dirname, "../db/migrations/grocerySeed.sql");
const grocerySeed = fs.readFileSync(sqlFilePath, { encoding: "utf-8" });

const databaseUrl = process.env.TEST_DB_URL;
const { Client } = require("pg");

async function dbSeed() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  await client.connect();
  await client.query("BEGIN");
  await client.query(grocerySeed);
  await client.query("COMMIT");
  await client.end();
}

async function dbClear() {
  const client = new Client({
    connectionString: databaseUrl,
  });
  const clearDB = `
    DROP TABLE IF EXISTS items CASCADE;
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS shopping_list CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS stores CASCADE;
    DROP TABLE IF EXISTS item_history CASCADE;
    DROP TABLE IF EXISTS purchase_history CASCADE;
  `;
  await client.connect();
  await client.query("BEGIN");
  await client.query(clearDB);
  await client.query("COMMIT");
  await client.end();
}

describe("Grocery API - /api/groceries", () => {
  beforeAll(async () => {
    await dbSeed();
  });

  afterAll(async () => {
    await dbClear();
  });

  //==================== ITEMS ====================
  describe("Items", () => {
    let testItemId; // For update/delete tests

    it("GET /items - should return all items", async () => {
      const res = await request(app).get("/api/groceries/items");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /createItem - should create a new item with all fields", async () => {
      const res = await request(app).post("/api/groceries/createItem").send({
        name: "Oreos",
        categoryId: 1,
        details: "Double stuffed",
        price_estimate: 4.99,
        quantity: 1,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("quantity", 1);
      expect(res.body).toHaveProperty("name", "oreos");
      expect(res.body).toHaveProperty("category_name");
    });

    it("POST /createItem - should create item without optional fields", async () => {
      const res = await request(app).post("/api/groceries/createItem").send({
        name: "Milk",
        categoryId: 1,
        quantity: 1,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "milk");
      testItemId = res.body.id; // Save for update/delete tests
    });

    it("POST /createItem - should throw 400 for null body", async () => {
      const res = await request(app)
        .post("/api/groceries/createItem")
        .send(null)
        .set("Content-Type", "application/json");

      expect(res.statusCode).toBe(400);
    });

    it("POST /createItem - should throw 400 for missing required fields", async () => {
      const res = await request(app).post("/api/groceries/createItem").send({
        name: "Test Item",
        // Missing categoryId and quantity
      });

      expect(res.statusCode).toBe(400);
    });

    it("POST /searchItem - should find items by query", async () => {
      const res = await request(app)
        .post("/api/groceries/searchItem")
        .send({ query: "Oreos" });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("POST /searchItem - should return empty array for no matches", async () => {
      const res = await request(app)
        .post("/api/groceries/searchItem")
        .send({ query: "NonexistentItem12345" });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /searchItem - should throw 400 when query is missing", async () => {
      const res = await request(app).post("/api/groceries/searchItem").send({});

      expect(res.statusCode).toBe(400);
    });

    it("POST /searchItem - should throw 400 when query is not a string", async () => {
      const res = await request(app)
        .post("/api/groceries/searchItem")
        .send({ query: 123 });

      expect(res.statusCode).toBe(400);
    });

    it("POST /searchItem - should be case insensitive", async () => {
      const res = await request(app)
        .post("/api/groceries/searchItem")
        .send({ query: "OREOS" });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("PUT /updateItem - should update an item", async () => {
      const res = await request(app).put("/api/groceries/item/2").send({
        id: 2,
        name: "Updated Milk",
        categoryId: 1,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name");
    });

    it("PUT /updateItem - should handle non-existent item", async () => {
      const res = await request(app).put("/api/groceries/updateItem").send({
        id: 99999,
        name: "Non-existent",
        categoryId: 1,
      });

      expect(res.statusCode).toBe(404);
    });

    it("DELETE /item - should delete an item", async () => {
      const res = await request(app).delete("/api/groceries/item/2");

      expect(res.statusCode).toBe(204);
    });

    it("DELETE /item - should handle deleting non-existent item", async () => {
      const res = await request(app).delete("/api/groceries/item/1000");

      expect(res.statusCode).toBe(404);
    });
  });

  // // // ==================== SHOPPING LIST ====================
  describe("Shopping List", () => {
    let listItemId;
    let itemIdForList;

    beforeAll(async () => {
      // Create an item to add to the list
      const createRes = await request(app)
        .post("/api/groceries/createItem")
        .send({
          name: "List Test Item",
          categoryId: 1,
          quantity: 1,
        });
      itemIdForList = createRes.body.id;
    });

    it("GET /list - should return all list items", async () => {
      const res = await request(app).get("/api/groceries/list");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /list - should add item to shopping list", async () => {
      const res = await request(app).post("/api/groceries/list").send({
        itemId: itemIdForList,
      });

      expect(res.statusCode).toBe(201);
      listItemId = res.body.id;
    });

    it("PUT /list/:id - should update list item quantity", async () => {
      const res = await request(app)
        .put(`/api/groceries/list/${listItemId}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("quantity");
    });

    it("PUT /list/:id - should handle non-existent list item", async () => {
      const res = await request(app)
        .put("/api/groceries/list/99999")
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(404);
    });

    it("DELETE /list/:id - should delete list item", async () => {
      const res = await request(app).delete(
        `/api/groceries/list/${listItemId}`,
      );

      expect(res.statusCode).toBe(204);
    });
  });

  // ==================== SHOPPING CART ====================
  describe("Shopping Cart", () => {
    let cartTestItemId;

    beforeAll(async () => {
      // Create a fresh item for cart tests
      const createRes = await request(app)
        .post("/api/groceries/createItem")
        .send({
          name: "Cart Test Item",
          categoryId: 1,
          quantity: 1,
        });
      cartTestItemId = createRes.body.id;
    });

    it("GET /cart - should return all cart items", async () => {
      const res = await request(app).get("/api/groceries/cart");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /cart/:itemId - should add item to cart", async () => {
      console.log(cartTestItemId);
      const res = await request(app).post(
        `/api/groceries/cart/${cartTestItemId}`,
      );

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeDefined();
    });

    it("POST /cart/:itemId - should NOT add duplicates to the cart", async () => {
      const res1 = await request(app).post(
        `/api/groceries/cart/${cartTestItemId}`,
      );
      const res2 = await request(app).post(
        `/api/groceries/cart/${cartTestItemId}`,
      );

      expect(res2.statusCode).toBe(404);
    });

    it("POST /cart/:itemId - should handle adding non-existent item", async () => {
      const res = await request(app).post("/api/groceries/cart/99999");

      expect(res.statusCode).toBe(404);
    });

    it("POST /list/returnItemToList/:id - should return item to list", async () => {
      // First add it back to cart
      await request(app).post(`/api/groceries/cart/${cartTestItemId}`);

      const res = await request(app).post(
        `/api/groceries/cart/returnToList/${cartTestItemId}`,
      );

      expect(res.statusCode).toBe(204);
    });

    it("POST /checkout - should checkout all cart items", async () => {
      // Add item to cart
      await request(app).post(`/api/groceries/cart/${cartTestItemId}`);
      const res = await request(app).post("/api/groceries/checkout");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Checkout successful");
    });
  });

  // // ==================== CATEGORIES ====================
  // describe("Categories", () => {
  //   let categoryId;

  //   it("GET /categories - should return all categories", async () => {
  //     const res = await request(app).get("/api/groceries/categories");

  //     expect(res.statusCode).toBe(200);
  //     expect(Array.isArray(res.body)).toBe(true);
  //     expect(res.body.length).toBeGreaterThan(0);
  //   });

  //   it("POST /categories - should create a new category", async () => {
  //     const res = await request(app)
  //       .post("/api/groceries/categories")
  //       .send({ name: "Test Category" });

  //     expect(res.statusCode).toBe(201);
  //     expect(res.body).toHaveProperty("name");
  //     categoryId = res.body.id;
  //   });

  //   it("POST /categories - should handle missing name", async () => {
  //     const res = await request(app).post("/api/groceries/categories").send({});

  //     expect(res.statusCode).toBe(400);
  //   });

  //   it("PUT /categories/:id - should update category name", async () => {
  //     const res = await request(app)
  //       .put(`/api/groceries/categories/${categoryId}`)
  //       .send({ name: "Updated Category" });

  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toHaveProperty("name");
  //   });

  //   it("PUT /categories/:id - should handle non-existent category", async () => {
  //     const res = await request(app)
  //       .put("/api/groceries/categories/99999")
  //       .send({ name: "Non-existent" });

  //     expect(res.statusCode).toBe(404);
  //   });

  //   it("DELETE /categories/:id - should delete category", async () => {
  //     const res = await request(app).delete(
  //       `/api/groceries/categories/${categoryId}`,
  //     );

  //     expect(res.statusCode).toBe(204);
  //   });
  // });

  // // ==================== STORES ====================
  // describe("Stores", () => {
  //   let storeId;

  //   it("GET /stores - should return all stores", async () => {
  //     const res = await request(app).get("/api/groceries/stores");

  //     expect(res.statusCode).toBe(200);
  //     expect(Array.isArray(res.body)).toBe(true);
  //   });

  //   it("POST /stores - should create a new store", async () => {
  //     const res = await request(app)
  //       .post("/api/groceries/stores")
  //       .send({ name: "Test Store" });

  //     expect(res.statusCode).toBe(201);
  //     expect(res.body).toHaveProperty("name");
  //     storeId = res.body.id;
  //   });

  //   it("POST /stores - should handle missing name", async () => {
  //     const res = await request(app).post("/api/groceries/stores").send({});

  //     expect(res.statusCode).toBe(400);
  //   });

  //   it("PUT /stores/:id - should update store name", async () => {
  //     const res = await request(app)
  //       .put(`/api/groceries/stores/${storeId}`)
  //       .send({ name: "Updated Store" });

  //     expect(res.statusCode).toBe(200);
  //     expect(res.body).toHaveProperty("name");
  //   });

  //   it("PUT /stores/:id - should handle non-existent store", async () => {
  //     const res = await request(app)
  //       .put("/api/groceries/stores/99999")
  //       .send({ name: "Non-existent" });

  //     expect(res.statusCode).toBe(404);
  //   });

  //   it("DELETE /stores/:id - should delete store", async () => {
  //     const res = await request(app).delete(`/api/groceries/stores/${storeId}`);

  //     expect(res.statusCode).toBe(204);
  //   });
  // });

  // ==================== EDGE CASES ====================
  //   describe("Edge Cases", () => {
  //     it("should handle malformed JSON", async () => {
  //       const res = await request(app)
  //         .post("/api/groceries/createItem")
  //         .send("not valid json")
  //         .type("json");

  //       expect(res.statusCode).toBeGreaterThanOrEqual(400);
  //     });

  //     it("should handle very long item names", async () => {
  //       const longName = "a".repeat(1000);
  //       const res = await request(app).post("/api/groceries/createItem").send({
  //         name: longName,
  //         categoryId: 1,
  //         quantity: 1,
  //       });

  //       // Should either accept or reject gracefully (not 500)
  //       expect(res.statusCode).toBeLessThan(500);
  //     });

  //     it("should handle negative quantities", async () => {
  //       const res = await request(app).post("/api/groceries/createItem").send({
  //         name: "Negative Item",
  //         categoryId: 1,
  //         quantity: -5,
  //       });

  //       // Should create successfully or reject gracefully
  //       expect([201, 400]).toContain(res.statusCode);
  //     });
  //   });
});
