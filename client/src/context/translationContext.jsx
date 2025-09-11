import { createContext, useContext, useEffect, useState, useMemo } from "react";

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
    const [locale, setLocale] = useState("en");
    const [translations, setTranslations] = useState({});

    // Detect language from URL or localStorage
    useEffect(() => {
        const urlLang = window.location.pathname.split("/")[1]; // e.g., /ru/home
        const savedLang = localStorage.getItem("locale");
        const availableLangs = ["en", "ru", "ro"];

        let initialLang = "en";
        if (availableLangs.includes(urlLang)) {
            initialLang = urlLang;
        } else if (savedLang && availableLangs.includes(savedLang)) {
            initialLang = savedLang;
        }

        setLocale(initialLang);
    }, []);

    // Load translations whenever locale changes
    useEffect(() => {
        if (!locale) return;

        // translation files are located under public/assets/locales
        fetch(`/assets/locales/${locale}.json`)
            .then((res) => res.json())
            .then((data) => setTranslations(data))
            .catch(() => setTranslations({}));

        // Save current locale in localStorage
        localStorage.setItem("locale", locale);
    }, [locale]);

    const value = useMemo(() => {
        // t supports dotted keys like 'categories.All' and falls back to the key
        const t = (key) => {
            if (!key) return key;
            if (!translations) return key;
            const parts = key.split('.');
            let res = translations;
            for (const p of parts) {
                if (res && Object.prototype.hasOwnProperty.call(res, p)) {
                    res = res[p];
                } else {
                    res = undefined;
                    break;
                }
            }
            return res === undefined ? key : res;
        };
        return { locale, setLocale, t };
    }, [locale, translations]);

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    return useContext(TranslationContext);
}
