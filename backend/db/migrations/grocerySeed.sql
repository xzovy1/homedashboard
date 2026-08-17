CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR (100)
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR ( 100 )
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR ( 100 ) UNIQUE,
    category_id INTEGER REFERENCES categories(id),
    price_estimate NUMERIC(6, 2) DEFAULT 0.00,
    details VARCHAR (100),
    quantity INTEGER DEFAULT 0,
    save_item BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS shopping_list (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE UNIQUE,
    store_id INTEGER REFERENCES stores(id),
    quantity INTEGER
);

CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR ( 100 ) UNIQUE,
    ingredients INTEGER REFERENCES items(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE IF NOT EXISTS upcoming_meals (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    dish INTEGER REFERENCES meals(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_data (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE UNIQUE,
    total_spent INTEGER,
    times_purchased INTEGER,
    date_added_to_list DATE,
    last_purchase DATE
);

CREATE TABLE IF NOT EXISTS purchase_history (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    purchase_date DATE
);


INSERT INTO stores (name)
VALUES 
    ('homes alive'),
    ('costco'),
    ('superstore'),
    ('save on'),
    ('safeway'),
    ('canadian tire'),
    ('home depot'),
    ('amazon');


INSERT INTO categories (name)
VALUES
    ('aisles'),
    ('bakery'),
    ('beverages'),
    ('dairy'),
    ('deli'),
    ('frozen'),
    ('household'),
    ('misc'),
    ('meat'),
    ('online'),
    ('pets'),
    ('fruit/produce'),
    ('toiletries');
