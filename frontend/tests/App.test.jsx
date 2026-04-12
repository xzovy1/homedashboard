import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App';

describe("App Component", () => {
    it("displays hero section and widget bar", () => {
        render(<App />);
        expect (screen.getByTestId("widgetBar")).toBeVisible();
        expect (screen.getByTestId("heroSection")).toBeVisible();
    })
})