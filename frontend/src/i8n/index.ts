import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from './en';
import frenchMessages from './fr';

const i18nProvider = polyglotI18nProvider((locale) => {
  if (locale === 'fr') {
    return frenchMessages;
  }

  // Always fallback on english
  return englishMessages;
}, 'en');

export default i18nProvider;
