import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import Header from '../component/Header.jsx';
import { useAuthApi } from '../context/apiAuthContext.jsx';
import { useTranslation } from '../context/translationContext.jsx';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';

// Mock dependencies
vi.mock('../context/apiAuthContext.jsx');
vi.mock('../context/translationContext.jsx');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
        useNavigate: vi.fn(),
    };
});

const mockNavigate = vi.fn();


const MockTranslationProvider = ({ children }) => {
    const t = (key) => key;
    return <>{children}</>;
};

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocation.mockReturnValue({ pathname: '/', hash: '' });
        useTranslation.mockReturnValue({ t: (key) => key, locale: 'en' });
    });

    describe('Guest User', () => {
        beforeEach(() => {
            useAuthApi.mockReturnValue({ user: null });
        });

        test('renders logo and navigation links', () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            expect(screen.getByText('CraftHub')).toBeInTheDocument();
            expect(screen.getByText('header.home')).toBeInTheDocument();
            expect(screen.getByText('header.shops')).toBeInTheDocument();
            expect(screen.getByText('header.items')).toBeInTheDocument();
        });

        test('navigates to signup page on account icon click', () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            const accountButton = screen.getByRole('button', { name: /User/i });
            fireEvent.click(accountButton);
            expect(mockNavigate).toHaveBeenCalledWith('/signup');
        });
    });

    describe('Logged In User', () => {
        const mockUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            profilePictureLink: 'https://example.com/avatar.jpg',
            roles: ['ROLE_USER'],
        };

        beforeEach(() => {
            useAuthApi.mockReturnValue({ user: mockUser, logout: vi.fn() });
        });

        test('displays user name and avatar', () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            expect(screen.getByText(`header.hi, ${mockUser.name}`)).toBeInTheDocument();
            const avatar = screen.getByAltText(mockUser.name);
            expect(avatar).toHaveAttribute('src', mockUser.profilePictureLink);
        });

        test('opens and closes user menu', () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            const accountButton = screen.getByRole('button', { name: /John Doe/i });
            fireEvent.click(accountButton);

            expect(screen.getByText('header.settings')).toBeInTheDocument();
            expect(screen.getByText('header.logout')).toBeInTheDocument();

            // Click outside to close
            fireEvent.mouseDown(document.body);
            expect(screen.queryByText('header.settings')).not.toBeInTheDocument();
        });

    });

    describe('Admin User', () => {
        const mockAdmin = {
            name: 'Admin User',
            email: 'admin@example.com',
            roles: ['ROLE_ADMIN'],
        };

        beforeEach(() => {
            useAuthApi.mockReturnValue({ user: mockAdmin, logout: vi.fn() });
        });

        test('shows Admin Dashboard link in user menu', () => {
            render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            const accountButton = screen.getByRole('button', { name: /Admin User/i });
            fireEvent.click(accountButton);
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        });
    });
});
