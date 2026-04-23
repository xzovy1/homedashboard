import { useState, useEffect, useCallback } from "react";

import ErrorComponent from "../Error";
import { SearchBar } from "./SearchBar";
import { CartToggle } from "./CartToggle";
import { SearchResult } from "./SearchResult";
import { Cart } from "./Cart";
import { List } from "./List";

import heroClasses from "../../assets/views/Hero.module.css";

export const GROCERIES_URL = `${import.meta.env.VITE_API_URL}/groceries`;

// --- Custom hook: isolates data-fetching logic from the view ---
function useGroceries() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${GROCERIES_URL}/categories`, {
          signal: controller.signal,
        });

        if (response.status >= 400) {
          throw new Error("Server error");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, []);

  return { categories, error, loading, setError };
}

// --- Component ---
const Groceries = () => {
  const { categories, error, loading, setError } = useGroceries();

  const [showCart, setShowCart] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dbItems, setDbItems] = useState([]);
  const [list, setList] = useState([]);

  const toggleCart = useCallback(() => setShowCart((prev) => !prev), []);

  if (loading) return <p>Loading...</p>;
  if (error) return <ErrorComponent error={error} />;

  return (
    <div className="app">
      <div className={heroClasses.header}>
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          dbItems={dbItems}
          setDbItems={setDbItems}
          list={list}
          setList={setList}
          setError={setError}
        />
        <CartToggle showCart={showCart} onToggle={toggleCart} />
      </div>

      <SearchResult
        dbItems={dbItems}
        setDbItems={setDbItems}
        searchText={searchText}
        setSearchText={setSearchText}
        list={list}
        setList={setList}
        categories={categories}
        setError={setError}
      />

      <div className={heroClasses.body}>
        {showCart ? (
          <Cart setError={setError} />
        ) : (
          <List
            list={list}
            setList={setList}
            categories={categories}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default Groceries;
