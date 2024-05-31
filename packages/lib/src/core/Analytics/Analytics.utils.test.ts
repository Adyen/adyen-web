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
     * billingAddressMode
     */
    describe('Testing billingAddressMode', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressMode';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal "none"', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });

        test('Expect the prop, when passed, to equal "none", because billingAddressRequired is passed as false', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: 'partial', billingAddressRequired: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });

        test('Expect the prop, when not passed, to equal  the default, when billingAddressRequired is passed as true', () => {
            const configData = getCardConfigData({ billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, when passed as "partial", to equal "partial", when billingAddressRequired is passed as true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: 'partial', billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('partial');
        });

        test('Expect the prop, when not passed, to equal "lookup", because onAddressLookup has been set', () => {
            const configData = getCardConfigData({ onAddressLookup: () => {}, billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('lookup');
        });

        test('Expect the prop, when passed as "partial", to equal "lookup", because onAddressLookup has been set', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: 'partial', onAddressLookup: () => {}, billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('lookup');
        });
    });

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
     * disableIOSArrowKeys
     */
    describe('Testing disableIOSArrowKeys', () => {
        const ANALYTICS_DATA_PROP = 'disableIOSArrowKeys';
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
     * doBinLookup
     */
    describe('Testing doBinLookup', () => {
        const ANALYTICS_DATA_PROP = 'doBinLookup';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal the default', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
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
     * enableStoreDetails
     */
    describe('Testing enableStoreDetails', () => {
        const ANALYTICS_DATA_PROP = 'enableStoreDetails';
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
     * exposeExpiryDate
     */
    describe('Testing exposeExpiryDate', () => {
        const ANALYTICS_DATA_PROP = 'exposeExpiryDate';
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
     * forceCompat
     */
    describe('Testing forceCompat', () => {
        const ANALYTICS_DATA_PROP = 'forceCompat';
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
     * hasBrandsConfiguration
     */
    describe('Testing brandsConfiguration prop and how it maps to a hasBrandsConfiguration value', () => {
        const ANALYTICS_DATA_PROP = 'hasBrandsConfiguration';
        const CARD_CONFIG_PROP = 'brandsConfiguration';

        test('Expect the prop, when brandsConfiguration is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when brandsConfiguration is passed, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: { visa: { icon: 'http://localhost:3000/nocard.svg', name: 'altVisa' } } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * hasData
     */
    describe('Testing data prop and how it maps to a hasData value', () => {
        const ANALYTICS_DATA_PROP = 'hasData';
        const CARD_CONFIG_PROP = 'data';

        test('Expect the prop, when data is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when data is passed, to equal true', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: { holderName: 'J. Smith' } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * hasDisclaimerMessage
     */
    describe('Testing disclaimerMessage prop and how it maps to a hasDisclaimerMessage value', () => {
        const ANALYTICS_DATA_PROP = 'hasDisclaimerMessage';
        const CARD_CONFIG_PROP = 'disclaimerMessage';

        test('Expect the prop, when disclaimerMessage is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when disclaimerMessage is passed, to equal true', () => {
            const configData = getCardConfigData({
                [CARD_CONFIG_PROP]: { message: 'By continuing you accept', linkText: 't&c', link: 'https://www.adyen.com' }
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * hasHolderName
     */
    describe('Testing hasHolderName', () => {
        const ANALYTICS_DATA_PROP = 'hasHolderName';
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
     * hasInstallmentOptions
     */
    describe('Testing installmentOptions prop and how it maps to a hasInstallmentOptions value', () => {
        const ANALYTICS_DATA_PROP = 'hasPlaceholders';
        const CARD_CONFIG_PROP = 'placeholders';

        test('Expect the prop, when installmentOptions is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when installmentOptions is passed, to equal true', () => {
            const configData = getCardConfigData({
                [CARD_CONFIG_PROP]: { mc: { values: [1, 2] } }
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * hasPlaceholders
     */
    describe('Testing placeholders prop and how it maps to a hasPlaceholders value', () => {
        const ANALYTICS_DATA_PROP = 'hasPlaceholders';
        const CARD_CONFIG_PROP = 'placeholders';

        test('Expect the prop, when placeholders is not passed, to equal false', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when placeholders is passed, to equal true', () => {
            const configData = getCardConfigData({
                [CARD_CONFIG_PROP]: { holderName: 'B Bob' }
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * hideCVC
     */
    describe('Testing hideCVC', () => {
        const ANALYTICS_DATA_PROP = 'hideCVC';
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
     * holderNameRequired
     */
    describe('Testing holderNameRequired', () => {
        const ANALYTICS_DATA_PROP = 'holderNameRequired';
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

    /**
     * keypadFix
     */
    describe('Testing keypadFix', () => {
        const ANALYTICS_DATA_PROP = 'keypadFix';
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
     * legacyInputMode
     */
    describe('Testing legacyInputMode', () => {
        const ANALYTICS_DATA_PROP = 'legacyInputMode';
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
     * maskSecurityCode
     */
    describe('Testing maskSecurityCode', () => {
        const ANALYTICS_DATA_PROP = 'maskSecurityCode';
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
     * minimumExpiryDate
     */
    describe('Testing minimumExpiryDate', () => {
        const ANALYTICS_DATA_PROP = 'minimumExpiryDate';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal "none"', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });

        test('Expect the prop, passed as a value, to equal that value', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: '01/26' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('01/26');
        });
    });

    /**
     * name
     */
    describe('Testing name', () => {
        const ANALYTICS_DATA_PROP = 'name';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not passed, to equal "none"', () => {
            const configData = getCardConfigData({});
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });

        test('Expect the prop, passed as a value, to equal that value', () => {
            const configData = getCardConfigData({ [CARD_CONFIG_PROP]: 'CCard' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('CCard');
        });
    });
});
