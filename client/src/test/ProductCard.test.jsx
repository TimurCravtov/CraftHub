import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import ProductCard from '../component/ProductCard.jsx';
import { useLikes } from '../context/likesContext.jsx';
import { useCart } from '../context/cartContext.jsx';
import { useToast } from '../context/toastContext.jsx';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock contexts
vi.mock('../context/likesContext.jsx');
vi.mock('../context/cartContext.jsx');
vi.mock('../context/toastContext.jsx');

const mockToggleLike = vi.fn();
const mockAddToCart = vi.fn();
const mockShowToast = vi.fn();

const product = {
    id: 1,
    uuid: 'abc-123',
    title: 'Test Product',
    price: '99.99',
    imageLinks: ['https://example.com/image.jpg'],
    shop: { name: 'Test Shop' },
};

const productWithoutImage = {
    id: 2,
    uuid: 'def-456',
    title: 'Another Product',
    price: '19.99',
    shop: { name: 'Another Shop' },
};


describe('ProductCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useLikes.mockReturnValue({ isLiked: () => false, toggleLike: mockToggleLike });
        useCart.mockReturnValue({ addToCart: mockAddToCart, items: [] });
        useToast.mockReturnValue({ showToast: mockShowToast });
    });

    test('renders product information correctly', () => {
        render(
            <MemoryRouter>
                <ProductCard product={product} />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Test Shop')).toBeInTheDocument();
        expect(screen.getByText('99.99 lei')).toBeInTheDocument();
        const image = screen.getByAltText('Test Product');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('uses a placeholder image if no image is provided', () => {
        render(
            <MemoryRouter>
                <ProductCard product={productWithoutImage} />
            </MemoryRouter>
        );
        const image = screen.getByAltText('Another Product');
        expect(image).toHaveAttribute('src', '/assets/product-placeholder.svg');
    });

    test('calls toggleLike when the heart button is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={product} />
            </MemoryRouter>
        );
        const heartButton = screen.getByRole('button', { name: /like/i });
        fireEvent.click(heartButton);
        expect(mockToggleLike).toHaveBeenCalledWith(product);
    });

    test('calls addToCart and showToast when the cart button is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={product} />
            </MemoryRouter>
        );
        const cartButton = screen.getByLabelText('Add to cart');
        fireEvent.click(cartButton);
        expect(mockAddToCart).toHaveBeenCalledWith(product, 1, { allowIncrement: false });
        expect(mockShowToast).toHaveBeenCalledWith('Added to cart', 'success', 5000, expect.any(Object));
    });

    test('shows a checkmark if the item is in the cart', () => {
        useCart.mockReturnValue({ addToCart: mockAddToCart, items: [product] });
        render(
            <MemoryRouter>
                <ProductCard product={product} />
            </MemoryRouter>
        );
        const cartButton = screen.getByLabelText('Add to cart');
        expect(cartButton.querySelector('svg')).toMatchSnapshot();
    });
});
