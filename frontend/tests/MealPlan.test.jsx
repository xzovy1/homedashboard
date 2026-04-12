import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import Widget from '../src/components/Widget'
import MealPlan from "../src/components/MealPlan"

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn().mockImplementation(actual.useState),
  };
});

describe("test widget module", () => {
    afterEach(() => vi.clearAllMocks());

    test("displays MealPlan Widget", () => {
      render(<MealPlan />)
      expect(screen.getByText("Meal Plan")).toBeVisible()
    })
})