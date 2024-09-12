import { useContext } from 'react';
import { TranslationContext } from '../../context/TranslationContext';

const DYNAMIC_VALUE_PATTERN = /\$\{(.*?)\}/g;

interface UseTranslationReturns {
  t: (key: string, variables?: { [key: string]: string | number }) => string;
  language: string;
  changeLanguage: (lang: string) => void;
}

/**
 * useTranslation에서 리턴된 번역 함수(t)를 사용해 번역 텍스트 값을 얻을 수 있는 hook
 * TranslationProvider 내에서만 호출되어야 함
 *
 * @returns {UseTranslationReturns} 번역 함수(t), 현재 언어(language), 언어 변경 함수(changeLanguage)를 포함하는 객체
 * @throws {Error} `useTranslation`이 `TranslationProvider` 외부에서 호출되는 경우 오류가 발생
 */

const useTranslation = (): UseTranslationReturns => {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error(
      'useTranslation은 TranslationProvider 내부에서 실행되어야 합니다.'
    );
  }

  const { currentTranslations, language, changeLanguage } = context;

  /**
   * 번역된 문자열을 반환하는 함수
   * 주어진 키에 해당하는 번역된 문자열을 찾아 리턴하고
   * 동적인 값의 경우, 문자열 내의 `${variable}` 값을 `variables` 객체의 값으로 대체합니다.
   *
   * @param {string} key - 번역할 문자열의 키
   * @param {Object} [variables={}] - 번역 문자열 내의 동적인 값의 플레이스 홀더를 대체할 객체
   * @param {string | number} variables.variableName - 문자열 내에서 `${variableName}` 형식으로 사용되는 변수
   *
   * @returns {string} - 키에 해당하는 번역된 문자열을 반환, 동적인 값이 있는 경우 `variables` 객체에 있는 값으로 translation 내부 ${value}가 대체 (만약 키가 번역 데이터에 존재하지 않는 경우, 키 자체를 반환)
   *
   * @example
   * Translation Provider에서 translations 파일이 다음과 같이 정의되어 있다고 가정
   *
      const translations = {
        en: {
          greeting: 'Hello ${name}!',
        },
        ko: {
          greeting: '안녕 ${name}!',
        },
      };
   *
   * t('greeting', { name: 'Choo' }) // "Hello Choo"를 반환
   * t('GoodMorning'); // 'GoodMorning'를 반환 (translation 내부에 데이터가 없기 때문에 키값 그대로 리턴)
   */

  const t = (
    key: string,
    variables: { [key: string]: string | number } = {}
  ): string => {
    return key in currentTranslations
      ? currentTranslations[key].replace(
          DYNAMIC_VALUE_PATTERN,
          (_, dynamicValue) => String(variables[dynamicValue] || '')
        )
      : key;
  };

  return { t, language, changeLanguage };
};

export default useTranslation;
