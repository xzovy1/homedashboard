import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemInfo from '../src/components/Grocery/ItemInfo';

const mockCategories = [
    { id: 1, name: 'Dairy' },
    { id: 2, name: 'Produce' },
];

const mockItem = {
    id: 10,
    name: 'Milk',
    details: 'Whole milk',
    price_estimate: 3.99,
    quantity: '2',
    category_id: 1,
    category_name: 'Dairy',
};

const defaultProps = {
    itemInfo: mockItem,
    setItemInfo: vi.fn(),
    categories: mockCategories,
    setList: vi.fn(),
    list: [mockItem],
    setError: vi.fn(),
    editItem: vi.fn(),
};

const renderComponent = (props = {}) =>
    render(<ItemInfo {...defaultProps} {...props} />);

beforeEach(() => {
    vi.clearAllMocks();
});

// --- Rendering ---

describe('rendering', () => {
    it('renders item view by default (not editing)', () => {
        renderComponent();
        expect(screen.getByText('Milk')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Name:' })).not.toBeInTheDocument();
    });

    it('displays the item name, category, and details in view mode', () => {
        renderComponent();
        expect(screen.getByText('Milk')).toBeInTheDocument();
        expect(screen.getByText('Dairy')).toBeInTheDocument();
        expect(screen.getByText('Whole milk')).toBeInTheDocument();
    });

    it('hides additional info by default', () => {
        renderComponent();
        expect(screen.queryByText('3.99')).not.toBeInTheDocument();
        expect(screen.queryByText('2')).not.toBeInTheDocument();
    });
});

// --- Show/hide additional info (view mode) ---

describe('additional info toggle in view mode', () => {
    it('shows additional info when "Show Additional Info" is clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByText('Show Additional Info'));
        expect(screen.getByText(/3.99/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('hides additional info when "Hide" is clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByText('Show Additional Info'));
        await userEvent.click(screen.getByText('Hide'));
        expect(screen.queryByText(/3.99/)).not.toBeInTheDocument();
    });
});

// --- Edit mode toggling ---

describe('edit mode toggling', () => {
    it('switches to edit mode when the edit icon is clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        expect(screen.getByRole('textbox', { name: 'Name:' })).toBeInTheDocument();
    });

    it('switches back to view mode when the back icon is clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByTestId('back-icon'));
        expect(screen.queryByRole('textbox', { name: 'Name:' })).not.toBeInTheDocument();
        expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('pre-populates edit fields with the current item values', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        expect(screen.getByRole('textbox', { name: 'Name:' })).toHaveValue('Milk');
        expect(screen.getByRole('textbox', { name: 'Details:' })).toHaveValue('Whole milk');
        expect(screen.getByRole('combobox', { name: 'Category:' })).toHaveValue('1');
    });

    it('closes the panel when the close icon is clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('close-icon'));
        expect(defaultProps.setItemInfo).toHaveBeenCalledWith(null);
    });
});

// --- Show/hide additional info (edit mode) ---

describe('additional info toggle in edit mode', () => {
    it('shows additional info fields in edit mode when toggled', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByText('Show Additional Info'));
        expect(screen.getByLabelText('Price Est:')).toBeInTheDocument();
        expect(screen.getByLabelText('Quantity:')).toBeInTheDocument();
    });

    it('hides additional info fields when "Hide" is clicked in edit mode', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByText('Show Additional Info'));
        await userEvent.click(screen.getByText('Hide'));
        expect(screen.queryByLabelText('Price Est:')).not.toBeInTheDocument();
    });
});

// --- Successful update ---

describe('on successful update', () => {
    const updatedItem = { ...mockItem, name: 'Oat Milk', categoryId: '2' };

    beforeEach(() => {
        defaultProps.editItem.mockResolvedValue(updatedItem);
    });

    it('calls editItem with form data and the item id', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
            expect(defaultProps.editItem).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Milk' }),
                mockItem.id
            )
        );
    });

    it('updates the list with merged item data', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
            expect(defaultProps.setList).toHaveBeenCalledWith([
                expect.objectContaining({ name: 'Oat Milk', category_id: 2 }),
            ])
        );
    });

    it('closes the panel after a successful update', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
            expect(defaultProps.setItemInfo).toHaveBeenCalledWith(null)
        );
    });

    it('does not call setError on success', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() => expect(defaultProps.setItemInfo).toHaveBeenCalled());
        expect(defaultProps.setError).not.toHaveBeenCalled();
    });

    it('submits updated name when the name field is changed', async () => {
        renderComponent();
        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.clear(screen.getByRole('textbox', { name: 'Name:' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Name:' }), 'Oat Milk');
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
            expect(defaultProps.editItem).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Oat Milk' }),
                mockItem.id
            )
        );
    });
});

// --- Failed update ---

describe('on failed update', () => {
    it('calls setError when editItem rejects', async () => {
        const error = new Error('Server error');
        defaultProps.editItem.mockRejectedValue(error);
        renderComponent();

        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() =>
            expect(defaultProps.setError).toHaveBeenCalledWith(error)
        );
    });

    it('does not call setList or setItemInfo when editItem rejects', async () => {
        defaultProps.editItem.mockRejectedValue(new Error('Server error'));
        renderComponent();

        await userEvent.click(screen.getByTestId('edit-icon'));
        await userEvent.click(screen.getByRole('button', { name: 'Update' }));

        await waitFor(() => expect(defaultProps.setError).toHaveBeenCalled());
        expect(defaultProps.setList).not.toHaveBeenCalled();
        expect(defaultProps.setItemInfo).not.toHaveBeenCalled();
    });
});