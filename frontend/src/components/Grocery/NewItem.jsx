import { GROCERIES_URL } from './Groceries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import classes from '../../assets/views/Groceries.module.css';

export const defaultCreateItem = async (data) => {
  const response = await fetch(`${GROCERIES_URL}/createItem`, {
    mode: "cors",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (response.status >= 400) throw new Error("Server error");
  return response.json();
};

export const NewItem = ({ searchText, setSearchText, setDbItems, addToList, categories, setError, createItem = defaultCreateItem }) => {




    return (
        <div className={classes.search}>
            <FontAwesomeIcon
                    icon={faXmark}
                    onClick={() => {
                        setSearchText("")
                    }}
                />
            <NewItemForm searchText={searchText} setDbItems={setDbItems} addToList={addToList} categories={categories} setError={setError} createItem={createItem}/>
        </div>
    );
};

export const NewItemForm = ({ searchText, setSearchText, setDbItems, addToList, categories, setError, createItem = defaultCreateItem }) => {
    const addItem = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target).entries());
        try {
            const newItem = await createItem(formData);
            addToList(newItem);
            setSearchText('');
            setDbItems([]);
        } catch (error) {
            setError(error);
        }
    };
    return (
            <form onSubmit={addItem} className={classes.newItemForm}>

                <div className={classes.formItem}>
                    <label htmlFor="item-name">Name</label>
                    <span><strong>{searchText}</strong></span>
                    <input
                        type="hidden"
                        name="name"
                        id="item-name"
                        value={searchText}
                        readOnly
                    />
                </div>

                <div className={classes.formItem}>
                    <label htmlFor="category">Category</label>
                    <select name="categoryId" id="category" required>
                        <option value="" >-- Select --</option>
                        {categories.map(({ id, name }) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className={classes.formItem}>
                    <label htmlFor="details">Notes</label>
                    <input type="text" name="details" id="details" />
                </div>

                <div className={classes.formItem}>
                    <label htmlFor="saveToDB">Save item</label>
                    <input type="checkbox" name="saveToDB" id="saveToDB" defaultChecked />
                </div>

                <button type="submit">Add To List</button>
            </form>

    )

}