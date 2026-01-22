import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { LanguagePicker } from '../component/LanguagePicker';
import { TranslationProvider, useTranslation } from '../context/translationContext';
import React from 'react';

// Mock the translation context
const MockTranslationProvider = ({ children, locale = 'en' }) => {
    const [currentLocale, setCurrentLocale] = React.useState(locale);
    const setLocale = (newLocale) => {
        setCurrentLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    // Mock the t function
    const t = (key) => key;

    return (
        <TranslationProvider value={{ locale: currentLocale, setLocale, t }}>
            {children}
        </TranslationProvider>
    );
};


describe('LanguagePicker', () => {
    test('renders the language picker button', () => {
        render(
            <MockTranslationProvider>
                <LanguagePicker />
            </MockTranslationProvider>
        );
        const button = screen.getByLabelText('Select language');
        expect(button).toBeInTheDocument();
    });

    test('shows the current language flag', () => {
        render(
            <MockTranslationProvider locale="en">
                <LanguagePicker />
            </MockTranslationProvider>
        );
        expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });

    test('opens the language menu on click', () => {
        render(
            <MockTranslationProvider>
                <LanguagePicker />
            </MockTranslationProvider>
        );
        const button = screen.getByLabelText('Select language');
        fireEvent.click(button);
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Русский')).toBeInTheDocument();
        expect(screen.getByText('Română')).toBeInTheDocument();
    });

    test('changes language on selection', () => {
        const { container } = render(
            <MockTranslationProvider>
                <LanguagePicker />
            </MockTranslationProvider>
        );

        const button = screen.getByLabelText('Select language');
        fireEvent.click(button);

        const romanianOption = screen.getByText('Română');
        fireEvent.click(romanianOption);

        // Check if the flag has changed
        expect(screen.getByText('🇷🇴')).toBeInTheDocument();

        // Check if the menu is closed
        expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
});
