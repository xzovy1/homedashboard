import { useEffect, useState, useCallback } from "react";

import { GROCERIES_URL } from './Groceries';
import classes from '../../assets/views/Groceries.module.css';
import { Category } from './Categories';
import ItemInfo from './ItemInfo';

const LIST_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

export const List = ({ setError, list, setList, categories }) => {
    const [itemInfo, setItemInfo] = useState(null);

    const fetchList = useCallback(async () => {
        try {
            const response = await fetch(`${GROCERIES_URL}/list`);
            if (response.status >= 400) throw new Error("Server error");
            const data = await response.json();
            setList(data);
        } catch (error) {
            setError(error);
        }
    }, [setList, setError]);

    useEffect(() => {
        fetchList();
        const intervalId = setInterval(fetchList, LIST_REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [fetchList]);

    const removeFromList = async (id) => {
        try {
            const response = await fetch(`${GROCERIES_URL}/list/${id}`, { method: "DELETE" });
            if (response.status >= 400) throw new Error("Server error");
            setList(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            setError(error);
        }
    };

    const addToCart = async (itemId) => {
        try {
            const response = await fetch(`${GROCERIES_URL}/cart/${itemId}`, { method: "POST" });
            if (response.status >= 400) throw new Error("Server error");
        } catch (error) {
            setError(error);
        }
    };

    const categoriesWithItems = categories.filter(cat =>
        list.some(item => item.category_id === cat.id)
    );

    return (
        <>
            {itemInfo && (
                <ItemInfo
                    itemInfo={itemInfo}
                    setItemInfo={setItemInfo}
                    categories={categories}
                    list={list}
                    setList={setList}
                    setError={setError}
                />
            )}

            {list.length > 0 ? (
                <div className={classes.categories}>
                    {categoriesWithItems.map(cat => (
                        <Category
                            key={cat.id}
                            categoryName={cat.name}
                            items={list.filter(item => item.category_id === cat.id)}
                            addToCart={addToCart}
                            removeFromList={removeFromList}
                            list={list}
                            setList={setList}
                            setError={setError}
                            setItemInfo={setItemInfo}
                        />
                    ))}
                </div>
            ) : (
                <p>No items in list</p>
            )}
        </>
    );
};