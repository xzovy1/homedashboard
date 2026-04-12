import { NewItemForm } from "./NewItem";
import { GROCERIES_URL } from "./Groceries";
import { useState } from "react";

import classes from '../../assets/views/Groceries.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";

export const SearchResult = ({dbItems, setDbItems, searchText, setSearchText, list, setList, categories, setError}) => {
    const addToList = async (item) => {
        const jsonString = JSON.stringify(item);
        await fetch(GROCERIES_URL + "/list", 
            {
                method: "post", 
                mode: 'cors', 
                body: jsonString,
                headers: {"content-type": "application/json"}
            }
        )
        .then(response => {
            if (response.status >= 400) {
                throw new Error("server error");
            }
        return response.json();
        })
        .then(response => {
            const id = response["item_id"];
            setList([
                ...list, 
                {...item}, 
            ]);
        })
        .catch((error) => setError(error))
    }
    if(dbItems.length > 0 && searchText != ""){
        return (
            <div className={`${classes.searchResult} ${classes.search}`}>
                <FontAwesomeIcon
                        icon={faXmark}
                        onClick={() => {
                            setSearchText("")
                        }}
                    />
                {dbItems.map(item => {
                    return (
                        <div key={item.id} className={classes.searchItem}>
                            <FontAwesomeIcon icon={faPlus} onClick={()=>{
                                addToList(item);
                                setSearchText('');
                                setDbItems([]);
                            }}/>
                            <div>{item.name}</div>
                        </div>
                    )}
                )}
                <ShowNewItemForm 
                    searchText={searchText}
                    setSearchText={setSearchText}
                    setDbItems={setDbItems}
                    addToList={addToList}
                    categories={categories}
                    setError={setError}
                    setList={setList}
                    list={list}
                />
            </div>
        )
    }    
    if(searchText != '' && dbItems.length == 0){
        
        return <NewItemForm
            searchText={searchText}
            setSearchText={setSearchText}
            setDbItems={setDbItems}
            addToList={addToList}
            categories={categories}
            setError={setError}
            setList={setList}
            list={list}
        />
    }
    return null;
}
const ShowNewItemForm = ({searchText, setSearchText, setDbItems, addToList, categories, setError, setList, list}) => {
    const [showForm, setShowForm] = useState(false);


    if(showForm){
        return (
            <NewItemForm
                searchText={searchText}
                setSearchText={setSearchText}
                setDbItems={setDbItems}
                addToList={addToList}
                categories={categories}
                setError={setError}
                setList={setList}
                list={list}
            />
        )
    }else{
        return (
            <div>
                <button onClick={()=>{setShowForm(true)}}>Create New Item</button>
            </div>
        )
    }
}