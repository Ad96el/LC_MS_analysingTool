import { TranslationMessages } from 'react-admin';
import frenchMessages from 'ra-language-french';

const customFrenchMessages: TranslationMessages = {
  ...frenchMessages,
  pos: {
    search: 'Rechercher',
    configuration: 'Configuration',
    language: 'Langue',
    theme: {
      name: 'Theme',
      light: 'Clair',
      dark: 'Obscur',
    },
    dashboard: {
      monthly_revenue: 'CA à 30 jours',
      month_history: "Chiffre d'affaire sur 30 jours",
      new_orders: 'Nouvelles commandes',
      pending_reviews: 'Commentaires à modérer',
      all_reviews: 'Voir tous les commentaires',
      new_customers: 'Nouveaux clients',
      all_customers: 'Voir tous les clients',
      pending_orders: 'Commandes à traiter',
    },
  },
};

export default customFrenchMessages;
