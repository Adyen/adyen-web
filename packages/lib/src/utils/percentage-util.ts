/**
 * Basis points in a whole unit. Payment APIs report interest rates in basis points: 1599 bps = 15.99%
 */
const BASIS_POINTS_IN_A_UNIT = 10000;

/**
 * @internal
 * Returns a localised string for a rate. The percent symbol and the spacing before it come from the
 * locale, the same way {@link getLocalisedAmount} takes the currency symbol from it.
 *
 * @param rate - Fraction of a whole unit. `0.1599` renders as `15.99%`
 * @param locale - Locale to format for
 * @param options - Options for {@link Intl.NumberFormatOptions}
 *
 * @example
 * getLocalisedPercentage(0.155, 'en-US'); // '15.5%'
 * getLocalisedPercentage(0.155, 'de-DE'); // '15,5 %', with a non-breaking space
 */
export const getLocalisedPercentage = (rate: number, locale: string, options: Intl.NumberFormatOptions = {}): string => {
    const localeOptions: Intl.NumberFormatOptions = {
        style: 'percent',
        maximumFractionDigits: 2,
        ...options
    };

    try {
        return rate.toLocaleString(locale, localeOptions);
    } catch {
        return String(rate);
    }
};

/**
 * @internal
 * Localised string for a rate reported in basis points, the unit payment APIs use for interest rates.
 * Keeps the conversion out of the views that render it.
 *
 * @param basisPoints - Rate in basis points. `1599` renders as `15.99%`
 * @param locale - Locale to format for
 * @param options - Options for {@link Intl.NumberFormatOptions}
 */
export const getLocalisedPercentageFromBasisPoints = (basisPoints: number, locale: string, options: Intl.NumberFormatOptions = {}): string =>
    getLocalisedPercentage(basisPoints / BASIS_POINTS_IN_A_UNIT, locale, options);
