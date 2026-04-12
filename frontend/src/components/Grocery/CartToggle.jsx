import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faList } from "@fortawesome/free-solid-svg-icons";

export const CartToggle = ({ onToggle, showCart }) => {
    const label = showCart ? "Switch to list view" : "Switch to cart view";

    return (
        <button
            onClick={onToggle}
            aria-label={label}
            aria-pressed={showCart}
            data-testid="cart-toggle"
        >
            <FontAwesomeIcon icon={showCart ? faList : faCartShopping} size="xl" />
        </button>
    );
};