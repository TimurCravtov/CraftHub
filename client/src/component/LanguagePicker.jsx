import { useTranslation } from '../context/translationContext.jsx';
import { useState } from 'react';

export function LanguagePicker() {
    const { locale, setLocale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'ro', name: 'Română', flag: '🇷🇴' },
    ];

    const handleLanguageChange = (code) => {
        setLocale(code);
        setIsOpen(false);
        // Update URL to reflect language (e.g., /en/home)
        const currentPath = window.location.pathname.split('/').slice(2).join('/') || 'home';
        window.history.pushState({}, '', `/${code}/${currentPath}`);
        localStorage.setItem('locale', code);
    };

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

    return (
        <div className="language-picker">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="language-picker-button"
                aria-label="Select language"
            >
                <span>{currentLanguage.flag}</span>
                <svg
                    className={`language-picker-arrow ${isOpen ? 'language-picker-arrow--open' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="language-picker-dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`language-picker-item ${locale === lang.code ? 'language-picker-item--active' : ''}`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}