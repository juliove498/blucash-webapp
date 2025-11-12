import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es';
import en from './en';

const resources = {
	es: {
		translation: es,
	},
	en: {
		translation: en,
	},
};

i18next.use(initReactI18next).init({
	resources,
	lng: 'es',
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
});

export default i18next;
