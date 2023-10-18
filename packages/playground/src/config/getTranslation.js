import {
    ar,
    cs_CZ,
    da_DK,
    de_DE,
    el_GR,
    en_US,
    es_ES,
    fi_FI,
    fr_FR,
    hr_HR,
    hu_HU,
    it_IT,
    ja_JP,
    ko_KR,
    nl_NL,
    pl_PL,
    pt_BR,
    pt_PT,
    ro_RO,
    ru_RU,
    sk_SK,
    sl_SI,
    sv_SE,
    zh_CN,
    zh_TW
} from '@adyen/adyen-web';

const translationMap = {
    ar: ar,
    'cs-CZ': cs_CZ,
    'da-DK': da_DK,
    'de-DE': de_DE,
    'el-GR': el_GR,
    'en-US': en_US,
    'es-ES': es_ES,
    'fi-FI': fi_FI,
    'fr-FR': fr_FR,
    'hr-HR': hr_HR,
    'hu-HU': hu_HU,
    'it-IT': it_IT,
    'ja-JP': ja_JP,
    'ko-KR': ko_KR,
    'nl-NL': nl_NL,
    'pl-PL': pl_PL,
    'pt-BR': pt_BR,
    'pt-PT': pt_PT,
    'ro-RO': ro_RO,
    'ru-RU': ru_RU,
    'sk-SK': sk_SK,
    'sl-SI': sl_SI,
    'sv-SE': sv_SE,
    'zh-CN': zh_CN,
    'zh-TW': zh_TW
};

export default function getTranslationFile(locale) {
    return translationMap[locale];
}
