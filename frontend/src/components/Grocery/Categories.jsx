import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faXmark } from "@fortawesome/free-solid-svg-icons";

import classes from '../../assets/views/Groceries.module.css';

export const Category = ({ categoryName, items, list, setList, addToCart, removeFromList, setItemInfo }) => {
    if (items.length === 0) return null;

    const removeItem = (id) => {
        const confirmation = confirm("Remove from list?");
        if(confirmation){

            removeFromList(id);
            setList(list.filter(i => i.id !== id));
        }
    };

    const moveToCart = (id) => {
        addToCart(id);
        setList(list.filter(i => i.id !== id));
    };

    return (
        <div className={classes.category}>
            <h3>{categoryName}</h3>
            {items.map(item => (
                <div key={item.id} className={classes.listItem}>
                    <button
                        className={classes.iconButton}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from list`}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setItemInfo(item)}
                        onKeyDown={e => e.key === 'Enter' && setItemInfo(item)}
                    >
                        {item.name}
                    </div>

                    <button
                        className={classes.iconButton}
                        onClick={() => moveToCart(item.id)}
                        aria-label={`Add ${item.name} to cart`}
                    >
                        <FontAwesomeIcon icon={faCartShopping} />
                    </button>
                </div>
            ))}
        </div>
    );
};