const googleLangCode = {
  es_MX: 'es',
  en: 'en',
  zh: 'zh-CH',
  pt_BR: 'pt',
  fr: 'fr',
  id: 'id'
};

const momentLangCode = {
  es_MX: 'es',
  en: 'en',
  zh: 'zh-cn',
  pt_BR: 'pt-br',
  fr: 'fr',
  id: 'id'
};

const isServer = typeof window === 'undefined';

export const getLanguages = () => {
  const txData = !isServer && JSON.parse(localStorage.getItem('txlive:languages'));
  return (
    txData &&
    txData.source &&
    [txData.source].concat(txData.translation).map(l => ({
      label: l.name,
      value: l.code
    }))
  );
};

export const getGoogleLangCode = lang => googleLangCode[lang || 'en'];
export const getMomentLangCode = lang => momentLangCode[lang || 'en'];
