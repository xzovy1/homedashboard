import { describe, it, expect, beforeAll, beforeEach, spyOn } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import WidgetBar from '../src/components/WidgetBar'
import Widget from '../src/components/Widget'
import App from "../src/App";
import Hero from "../src/components/Hero";
import { focusCarouselWidget } from "../src/components/WidgetBar";

vi.mock("../src/components/WidgetBar", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Keep the real WidgetBar component
    focusCarouselWidget: vi.fn(), // Replace only the focus function with a mock
  };
});


it("displays Weather Widget", async () => {
    render(<WidgetBar widgetBarStatus={true}/>);
    await expect(screen.getByTestId('weather')).toBeVisible();
})
it("displays Todo Widget", () => {
    render(<WidgetBar widgetBarStatus={true}/>);
    expect(screen.getByText("Todos")).toBeVisible();
})
it("displays Meal Plan Widget", () => {
    render(<WidgetBar widgetBarStatus={true}/>);
    expect(screen.getByText("Meal Plan")).toBeVisible();
})

it("scrolls to selected widget app when interacting with the widget bar", async () => {
    const user = userEvent.setup();
    render(<WidgetBar widgetBarStatus={true}/>);
    
    const todoButton = screen.getByText("Todos");
    
    await user.click(todoButton);
    

})
