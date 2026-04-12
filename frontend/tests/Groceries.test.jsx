import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { GROCERIES_URL } from "../src/components/Grocery/Groceries";
vi.mock('../src/components/GroceryComponents/NewItem.jsx', () => ({
    NewItem: () => <div data-testid="newItemForm" />
}))

import { CartToggle } from "../src/components/Grocery/CartToggle";
describe("test cart toggle", () => {
    it("calls setShowCart when clicked", async () => {
        const onToggle = vi.fn()
        render(<CartToggle onToggle={onToggle} showCart={false} />)
        await userEvent.click(screen.getByTestId('cart-toggle'))
        expect(onToggle).toHaveBeenCalledTimes(1);
    })
})

import { SearchBar } from "../src/components/Grocery/SearchBar";
describe("test search bar", () => {
    const testInput = "testitem";
    let user, setDbItems, setError, setLoading;

    const renderSearchBar = () => {
        const Wrapper = () => {
            const [searchText, setSearchText] = useState("");
            return (
                <SearchBar
                    searchText={searchText}
                    setSearchText={setSearchText}
                    setDbItems={setDbItems}
                    setError={setError}
                    setLoading={setLoading}
                />
            )
        }
        render(<Wrapper />)
    }

    beforeEach(() => {
        user = userEvent.setup();
        setDbItems = vi.fn();
        setError = vi.fn();
        setLoading = vi.fn();
    })

    it("searches for items", async () => {
        renderSearchBar()
        expect(screen.getByRole("searchbox", {value: testInput})).toBeVisible();
        const input = screen.getByRole("searchbox");
        console.log(input)
        await user.click(input);
        for(let i = 0; i < testInput.length; i++){
            await user.type(input, testInput[i])
        }
        
        expect(setDbItems).toBeCalledTimes(testInput.length)
        expect(setDbItems).toBeCalledWith({"query": "test item"})
    })

    it("return an empty value when search is cleared", async () => {
       renderSearchBar();
        expect(screen.getByRole("searchbox", {value: testInput})).toBeVisible();
        const input = screen.getByRole("searchbox");
        await user.click(input);
        for(let i = 0; i < testInput.length; i++){
            await user.type(input, testInput[i])
        }
        for(let i = 0; i < testInput.length; i++){
            await user.keyboard("{backspace}")
        }
        expect(setDbItems).toBeCalledWith([])
    })

    it("calls fetch with correct url, method, headers , and body", async () => {
        renderSearchBar();
        const input = screen.getByRole("searchbox");
        await user.type(input, "test item");
        const URL = GROCERIES_URL +  "/searchItem/test";
        const response = await fetch(URL, {method: 'post'});
        const reqInfo = await response.json();
        
        expect(reqInfo.method).toBe("POST");
        expect(reqInfo.url).toBe(URL);
    })
})

import { SearchResult } from "../src/components/Grocery/SearchResult";
describe("test search result", () => {
    let user, dbItems, setDbItems, setError, searchText, setSearchText, list, setList, categories;
    beforeEach(() => {
        user = userEvent.setup();
        setDbItems = vi.fn();
        setError = vi.fn();
        setSearchText = vi.fn();
        setList = vi.fn();
        dbItems = [];
        categories = [];
        searchText=""
    })

    const renderSearchResult = () => render(
        <SearchResult 
            dbItems={dbItems} 
            setDbItems={setDbItems} 
            setError={setError} 
            searchText={searchText} 
            setSearchText={setSearchText} 
            list={list} 
            setList={setList} 
            categories={categories}
        />)

    it("displays null when no text is in searchBar", () => {
        const {container} = renderSearchResult();
        expect(container).toBeEmptyDOMElement();
    })
    it("displays new item component when search text is filled but no items found in db", async () => {

        searchText = "test item";
        renderSearchResult();
        //submit button in NewItem Component
        expect(screen.getByRole("button", {name: "Add To List"})).toBeVisible();
    })

    it("properly displays item from db", async () => {
        searchText = "test item";
        dbItems = [{id: 0, name: searchText}]
        renderSearchResult();
        expect(screen.getByText(searchText)).toBeVisible()
    })

    it("can display more than one item from db", () => {
        searchText = "test item";
        dbItems = [
            {id: 0, name: searchText},
            {id: 1, name: searchText + ' 1'},
            {id: 2, name: searchText + ' 2'},
            {id: 3, name: searchText + ' 3'},
        ]
        renderSearchResult();
        for(let i = 1; i <= 3; i++){
            expect(screen.getByText(searchText + ` ${i}`)).toBeVisible()
        }
    })
})
    