import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { GROCERIES_URL } from './Groceries';
import classes from '../../assets/views/Groceries.module.css';

export const Cart = ({ setError }) => {
    const [cart, setCart] = useState([]);

    const fetchCart = useCallback(async () => {
        try {
            const response = await fetch(`${GROCERIES_URL}/cart`);
            if (response.status >= 400) throw new Error("Server error");
            const data = await response.json();
            setCart(data);
        } catch (error) {
            setError(error);
        }
    }, [setError]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const returnItemToList = async (item) => {
        try {
            const response = await fetch(`${GROCERIES_URL}/cart/returnToList/${item.id}`, { method: "POST" });
            if (response.status >= 400) throw new Error("Server error");
            setCart(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
            setError(error);
        }
    };

    const checkout = async () => {
        try {
            const response = await fetch(`${GROCERIES_URL}/checkout`, { method: "POST" });
            if (response.status >= 400) throw new Error("Server error");
            setCart([]);
        } catch (error) {
            setError(error);
        }
    };

    if (cart.length === 0) return <p>No items in cart</p>;

    return (
        <div className={classes.cart}>
            <div className={classes.cartItems}>
                {cart.map(item => (
                    <div key={item.id} className={classes.cartItem}>
                        <button
                            className={classes.iconButton}
                            onClick={() => returnItemToList(item)}
                            aria-label={`Return ${item.name} to list`}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>{item.name}</div>
                    </div>
                ))}
            </div>
            <button onClick={checkout}>Checkout</button>
        </div>
    );
};