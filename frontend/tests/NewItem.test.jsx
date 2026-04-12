import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewItem } from '../src/components/Grocery/NewItem';

const mockCategories = [
  { id: 1, name: 'Dairy' },
  { id: 2, name: 'Produce' },
];

const defaultProps = {
  searchText: 'Milk',
  setSearchText: vi.fn(),
  setDbItems: vi.fn(),
  addToList: vi.fn(),
  categories: mockCategories,
  setError: vi.fn(),
  createItem: vi.fn(),
};

const renderComponent = (props = {}) =>
  render(<NewItem {...defaultProps} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Rendering ---

describe('rendering', () => {
  it('displays the searchText as the item name', () => {
    renderComponent({ searchText: 'Bananas' });
    expect(screen.getByText('Bananas')).toBeInTheDocument();
  });

  it('renders all category options plus the placeholder', () => {
    renderComponent();
    expect(screen.getByRole('option', { name: '-- Select --' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dairy' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Produce' })).toBeInTheDocument();
  });

  it('renders the save item checkbox checked by default', () => {
    renderComponent();
    expect(screen.getByLabelText('Save item')).toBeChecked();
  });

  it('renders with an empty category list without crashing', () => {
    renderComponent({ categories: [] });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

// --- Successful submission ---

describe('on successful submit', () => {
  const newItem = { id: 99, name: 'Milk', categoryId: 1 };

  beforeEach(() => {
    defaultProps.createItem.mockResolvedValue(newItem);
  });

  it('calls createItem with form data', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Milk', categoryId: '1' })
      )
    );
  });

  it('calls addToList with the response item', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.addToList).toHaveBeenCalledWith(newItem)
    );
  });

  it('clears searchText after submission', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.setSearchText).toHaveBeenCalledWith('')
    );
  });

  it('clears dbItems after submission', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.setDbItems).toHaveBeenCalledWith([])
    );
  });

  it('does not call setError on success', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() => expect(defaultProps.addToList).toHaveBeenCalled());
    expect(defaultProps.setError).not.toHaveBeenCalled();
  });

  it('includes optional notes in the submitted data', async () => {
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.type(screen.getByLabelText('Notes'), 'Organic please');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ details: 'Organic please' })
      )
    );
  });
});

// --- Failed submission ---

describe('on failed submit', () => {
  it('calls setError when createItem rejects', async () => {
    const error = new Error('Server error');
    defaultProps.createItem.mockRejectedValue(error);
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() =>
      expect(defaultProps.setError).toHaveBeenCalledWith(error)
    );
  });

  it('does not call addToList when createItem rejects', async () => {
    defaultProps.createItem.mockRejectedValue(new Error('Server error'));
    renderComponent();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    await waitFor(() => expect(defaultProps.setError).toHaveBeenCalled());
    expect(defaultProps.addToList).not.toHaveBeenCalled();
  });
});

// --- Validation ---

describe('form validation', () => {
  it('does not submit if no category is selected', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Add To List' }));

    expect(defaultProps.createItem).not.toHaveBeenCalled();
  });
});