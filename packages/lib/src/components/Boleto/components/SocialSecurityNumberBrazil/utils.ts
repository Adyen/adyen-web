import { CPF_LENGTH } from './constants';

export function maskCPF(value) {
    return value
        .replace(/\W/gi, '')
        .replace(/(\d{3})(?!$)/g, '$1.')
        .replace(/(.{11}).(\d{1,2})$/g, '$1-$2');
}

export function maskCNPJ(value) {
    return value.replace(
        /^(\d{2})(\d{3})(\d{3})?(\d{4})?(\d{1,2})?$/g,
        (match, g1, g2, g3, g4 = '', g5 = '') => `${g1}.${g2}.${g3}/${g4}${g5.length ? `-${g5}` : ''}`
    );
}

export function cleanCPFCNPJ(value) {
    return value.replace(/[^0-9]/g, '').trim();
}

export function formatCPFCNPJ(value = '') {
    if (typeof value !== 'string') return '';
    const cleanValue = cleanCPFCNPJ(value);
    const formattedValue = cleanValue.length > CPF_LENGTH ? maskCNPJ(cleanValue) : maskCPF(cleanValue);
    return formattedValue;
}
