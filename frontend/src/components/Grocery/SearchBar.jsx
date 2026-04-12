import { GROCERIES_URL } from "./Groceries";
import classes from "../../assets/views/Groceries.module.css";

export const SearchBar = ({ searchText, setSearchText, setDbItems, setError }) => {

    const searchItem = async (query) => {
        try {
            const response = await fetch(`${GROCERIES_URL}/searchItem`, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (response.status >= 400) throw new Error("Server error");

            const data = await response.json();
            setDbItems(data);
        } catch (error) {
            setError(error);
        }
    };

    const handleChange = (e) => {
        const query = e.target.value;
        setSearchText(query);

        if (query !== '') {
            searchItem(query);
        } else {
            setDbItems([]);
        }
    };

    return (
        <form onSubmit={e => e.preventDefault()}>
            <label htmlFor="query" className="sr-only"></label>
            <input
                type="search"
                id="query"
                name="query"
                autoComplete="off"
                placeholder="Search"
                className={classes.query}
                value={searchText}
                onChange={handleChange}
            />
        </form>
    );
};