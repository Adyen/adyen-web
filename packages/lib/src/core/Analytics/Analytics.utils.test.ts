import { getCardConfigData } from './utils';
import CardDefaultProps from '../../components/Card/components/CardInput/defaultProps';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from '../../components/ThreeDS2/config';

describe('Testing creating a configData object for the Card components', () => {
    /**
     * autoFocus
     */
    describe('Testing autoFocus', () => {
        const ANALYTICS_DATA_PROP = 'autoFocus'; // The name of the prop in the configData object sent to the analytics endpoint
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP; // The name of the prop in the Card configuration

        test('Expect the prop, when not passed, to equal the default', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * billingAddressAllowedCountries
     */
    // TODO - test for billingAddressAllowedCountries once we confirm how to represent the presence, or absence, of the array

    /**
     * billingAddressRequired
     */
    describe('Testing billingAddressRequired', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressRequired';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal the default', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * billingAddressRequiredFields
     */
    // TODO - test for billingAddressRequiredFields once we confirm how to represent the presence, or absence, of the array

    /**
     * brands
     */
    // TODO - still have to confirm that these are the desired values
    describe('Testing brands', () => {
        const ANALYTICS_DATA_PROP = 'brands';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to literally equal "default"', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('default');
        });

        test('Expect the prop, passed as an array, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: ['mc', 'bcmc', 'uatp', 'visa'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });

        test('Expect the prop, passed as an array with one value, to equal "single"', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: ['mc'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('single');
        });
    });

    /**
     * challengeWindowSize
     */
    describe('Testing challengeWindowSize', () => {
        const ANALYTICS_DATA_PROP = 'challengeWindowSize';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal the default', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(DEFAULT_CHALLENGE_WINDOW_SIZE);
        });

        test('Expect the prop, passed as a value, to equal that value', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: '01' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('01');
        });
    });

    /**
     * isStylesConfigured
     */
    describe('Testing styles prop and how it maps to a isStylesConfigured value', () => {
        const ANALYTICS_DATA_PROP = 'isStylesConfigured';
        const CARD_CONFIG_PROP = 'styles';

        test('Expect the prop, when styles is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when styles is passed, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: { base: { fontWeight: 300 } } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });
});
