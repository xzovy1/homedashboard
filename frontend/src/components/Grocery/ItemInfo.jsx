import classes from '../../assets/views/Groceries.module.css';
import { GROCERIES_URL } from './Groceries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPenToSquare, faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export const defaultEditItem = async (data, itemId) => {
    const response = await fetch(`${GROCERIES_URL}/item/${itemId}`, {
        mode: 'cors',
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (response.status >= 400) throw new Error('Server error');
    return response.json();
};

const ItemInfo = ({ itemInfo, setItemInfo, categories, setList, list, setError, editItem = defaultEditItem }) => {
    const [editing, setEditing] = useState(false);
    const [itemName, setItemName] = useState(itemInfo.name);
    const [itemDetails, setItemDetails] = useState(itemInfo.details);
    const [priceEstimate, setPriceEstimate] = useState(itemInfo.price_estimate);
    const [quantity, setQuantity] = useState(itemInfo.quantity);
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

    const additionalInfoProps = { showAdditionalInfo, setShowAdditionalInfo };

    const updateItemInfo = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target).entries());
        try {
            const editedItem = await editItem(formData, itemInfo.id);
            const merged = {
                ...itemInfo,
                ...editedItem,
                category_id: parseInt(editedItem.categoryId),
            };
            setList(list.map(item => item.id === itemInfo.id ? merged : item));
            setItemInfo(null);
        } catch (error) {
            setError(error);
        }
    };

    return (
        <div className={classes.itemInfo}>
            <div className={classes.icons}>
                <FontAwesomeIcon icon={faXmark} data-testid="close-icon" onClick={() => setItemInfo(null)} />
                {editing
                    ? <FontAwesomeIcon icon={faLeftLong} data-testid="back-icon" onClick={() => setEditing(false)} />
                    : <FontAwesomeIcon icon={faPenToSquare} data-testid="edit-icon" onClick={() => setEditing(true)} />
                }
            </div>

            {editing ? (
                <ItemEdit
                    itemName={itemName}
                    setItemName={setItemName}
                    itemInfo={itemInfo}
                    itemDetails={itemDetails}
                    setItemDetails={setItemDetails}
                    priceEstimate={priceEstimate}
                    setPriceEstimate={setPriceEstimate}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    updateItemInfo={updateItemInfo}
                    categories={categories}
                    {...additionalInfoProps}
                />
            ) : (
                <Item
                    itemName={itemName}
                    itemInfo={itemInfo}
                    itemDetails={itemDetails}
                    priceEstimate={priceEstimate}
                    quantity={quantity}
                    {...additionalInfoProps}
                />
            )}
        </div>
    );
};

const Item = ({ itemName, itemInfo, itemDetails, priceEstimate, quantity, showAdditionalInfo, setShowAdditionalInfo }) => (
    <div>
        <div>Name: <strong>{itemName}</strong></div>
        <div>Category: <strong>{itemInfo.category_name}</strong></div>
        <div>Details: <strong>{itemDetails}</strong></div>

        <a onClick={() => setShowAdditionalInfo(prev => !prev)}>
            {showAdditionalInfo ? 'Hide' : 'Show Additional Info'}
        </a>

        {showAdditionalInfo && (
            <div className={classes.formInfo}>
                <div>Price Estimate: <strong>{priceEstimate}</strong></div>
                <div>Quantity: <strong>{quantity}</strong></div>
            </div>
        )}
    </div>
);

const ItemEdit = ({
    itemName, setItemName,
    itemInfo,
    itemDetails, setItemDetails,
    priceEstimate, setPriceEstimate,
    quantity, setQuantity,
    updateItemInfo,
    categories,
    showAdditionalInfo, setShowAdditionalInfo,
}) => (
    <div>
        <form onSubmit={updateItemInfo}>
            <div>
                <label htmlFor="name">Name: </label>
                <input id="name" name="name" value={itemName} onChange={e => setItemName(e.target.value)} />
            </div>

            <div>
                <label htmlFor="category">Category: </label>
                <select name="categoryId" id="category" defaultValue={itemInfo.category_id}>
                    <option value="">-- Select --</option>
                    {categories.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="details">Details: </label>
                <input
                    type="text"
                    id="details"
                    name="details"
                    value={itemDetails}
                    onChange={e => setItemDetails(e.target.value)}
                />
            </div>

            <a onClick={() => setShowAdditionalInfo(prev => !prev)}>
                {showAdditionalInfo ? 'Hide' : 'Show Additional Info'}
            </a>

            {showAdditionalInfo && (
                <div className={classes.formInfo}>
                    <div>
                        <label htmlFor="price_estimate">Price Est: </label>
                        <input
                            type="number"
                            id="price_estimate"
                            name="price_estimate"
                            value={priceEstimate}
                            onChange={e => setPriceEstimate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity">Quantity: </label>
                        <input
                            type="text"
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <button type="submit">Update</button>
        </form>
    </div>
);

export default ItemInfo;