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
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Select language"
            >
                <span>{currentLanguage.flag}</span>
                <svg
                    className={`w-4 h-4 transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 ${
                                locale === lang.code ? 'bg-blue-50 text-blue-600' : ''
                            }`}
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