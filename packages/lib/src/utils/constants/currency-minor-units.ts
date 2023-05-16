/** Work around solution until chromium bug is fixed https://bugs.chromium.org/p/chromium/issues/detail?id=1381996
 * We need to hardcode minimumFractionDigits for the following currencies
 */
export const currencyMinorUnitsConfig = {
    RSD: { minimumFractionDigits: 2 },
    AFN: { minimumFractionDigits: 2 },
    ALL: { minimumFractionDigits: 2 },
    IRR: { minimumFractionDigits: 2 },
    LAK: { minimumFractionDigits: 2 },
    LBP: { minimumFractionDigits: 2 },
    MMK: { minimumFractionDigits: 2 },
    SOS: { minimumFractionDigits: 2 },
    SYP: { minimumFractionDigits: 2 },
    YER: { minimumFractionDigits: 2 },
    IQD: { minimumFractionDigits: 3 }
};
