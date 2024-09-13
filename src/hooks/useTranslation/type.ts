export interface UseTranslationReturns {
  t: (key: string, variables?: { [key: string]: string | number }) => string;
  language: string;
  changeLanguage: (lang: string) => void;
}
