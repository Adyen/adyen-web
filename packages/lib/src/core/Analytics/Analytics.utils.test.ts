import { getCardConfigData } from './utils';
import CardDefaultProps from '../../components/Card/components/CardInput/defaultProps';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from '../../components/ThreeDS2/config';
import { DEFAULT_CARD_GROUP_TYPES } from '../../components/internal/SecuredFields/lib/configuration/constants';
import { reject } from '../../components/internal/SecuredFields/utils';
import CardInputDefaultProps from '../../components/Card/components/CardInput/defaultProps';

describe('Testing creating a configData object for the Card components', () => {
    const defaultCardProps = {
        showBrandsUnderCardNumber: true,
        showFormInstruction: true,
        _disableClickToPay: false,
        doBinLookup: true,
        ...reject(['type', 'setComponentRef']).from(CardInputDefaultProps)
    };

    /**
     * 1. autoFocus
     */
    describe('Testing autoFocus', () => {
        const ANALYTICS_DATA_PROP = 'autoFocus'; // The name of the prop in the configData object sent to the analytics endpoint
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP; // The name of the prop in the Card configuration

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 2. billingAddressAllowedCountries
     */
    describe('Testing billingAddressAllowedCountries', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressAllowedCountries';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default (as a JSON string)', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(CardDefaultProps[CARD_CONFIG_PROP]));
        });

        test('Expect the prop, passed as an array, to equal that array (as a JSON string)', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: ['US', 'PR'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(['US', 'PR']));
        });
    });

    /**
     * 3. billingAddressMode
     */
    describe('Testing billingAddressMode', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressMode';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, when passed as "partial", to equal "partial", regardless of what is set for billingAddressRequired', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'partial', billingAddressRequired: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('partial');
        });

        test('Expect the prop, when not passed, to equal the default, when billingAddressRequired is passed as true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, when passed as "partial", to equal "partial", when billingAddressRequired is passed as true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'partial', billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('partial');
        });

        test('Expect the prop, when not passed, to equal "lookup", because onAddressLookup has been set', () => {
            const configData = getCardConfigData({ ...defaultCardProps, onAddressLookup: () => {}, billingAddressRequired: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('lookup');
        });

        test('Expect the prop, when passed as "partial", to equal "lookup", because onAddressLookup has been set', () => {
            const configData = getCardConfigData({
                ...defaultCardProps,
                [CARD_CONFIG_PROP]: 'partial',
                onAddressLookup: () => {},
                billingAddressRequired: true
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('lookup');
        });
    });

    /**
     * 4. billingAddressRequired
     */
    describe('Testing billingAddressRequired', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressRequired';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 5. billingAddressRequiredFields
     */
    describe('Testing billingAddressRequiredFields', () => {
        const ANALYTICS_DATA_PROP = 'billingAddressRequiredFields';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default (as a JSON string)', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(CardDefaultProps[CARD_CONFIG_PROP]));
        });

        test('Expect the prop, passed as an array, to equal that array (as a JSON string)', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: ['postalCode', 'country'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(['postalCode', 'country']));
        });
    });

    /**
     * 6. brands
     */
    describe('Testing brands', () => {
        const ANALYTICS_DATA_PROP = 'brands';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default (as a JSON string)', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(DEFAULT_CARD_GROUP_TYPES));
        });

        test('Expect the prop, passed as an array, to equal that array (as a JSON string)', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: ['mc', 'bcmc', 'uatp', 'visa'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(['mc', 'bcmc', 'uatp', 'visa']));
        });

        test('Expect the prop, passed as an array with one value, to equal that array (as a JSON string)', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: ['mc'] });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(JSON.stringify(['mc']));
        });
    });

    /**
     * 7. challengeWindowSize
     */
    describe('Testing challengeWindowSize', () => {
        const ANALYTICS_DATA_PROP = 'challengeWindowSize';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(DEFAULT_CHALLENGE_WINDOW_SIZE);
        });

        test('Expect the prop, passed as a value, to equal that value', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: '01' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('01');
        });
    });

    /**
     * 8. disableIOSArrowKeys
     */
    describe('Testing disableIOSArrowKeys', () => {
        const ANALYTICS_DATA_PROP = 'disableIOSArrowKeys';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 9. doBinLookup
     */
    describe('Testing doBinLookup', () => {
        const ANALYTICS_DATA_PROP = 'doBinLookup';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 10. enableStoreDetails
     */
    describe('Testing enableStoreDetails', () => {
        const ANALYTICS_DATA_PROP = 'enableStoreDetails';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 11. exposeExpiryDate
     */
    describe('Testing exposeExpiryDate', () => {
        const ANALYTICS_DATA_PROP = 'exposeExpiryDate';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 12. forceCompat
     */
    describe('Testing forceCompat', () => {
        const ANALYTICS_DATA_PROP = 'forceCompat';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 13. hasBrandsConfiguration
     */
    describe('Testing brandsConfiguration prop and how it maps to a hasBrandsConfiguration value', () => {
        const ANALYTICS_DATA_PROP = 'hasBrandsConfiguration';
        const CARD_CONFIG_PROP = 'brandsConfiguration';

        test('Expect the prop, when brandsConfiguration is not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when brandsConfiguration is passed, to equal true', () => {
            const configData = getCardConfigData({
                ...defaultCardProps,
                [CARD_CONFIG_PROP]: { visa: { icon: 'http://localhost:3000/nocard.svg', name: 'altVisa' } }
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 14. hasData
     */
    describe('Testing data prop and how it maps to a hasData value', () => {
        const ANALYTICS_DATA_PROP = 'hasData';
        const CARD_CONFIG_PROP = 'data';

        test('Expect the prop, when data is not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when data is passed, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: { holderName: 'J. Smith' } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 15. hasDisclaimerMessage
     */
    describe('Testing disclaimerMessage prop and how it maps to a hasDisclaimerMessage value', () => {
        const ANALYTICS_DATA_PROP = 'hasDisclaimerMessage';
        const CARD_CONFIG_PROP = 'disclaimerMessage';

        test('Expect the prop, when disclaimerMessage is not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when disclaimerMessage is passed, to equal true', () => {
            const configData = getCardConfigData({
                ...defaultCardProps,
                [CARD_CONFIG_PROP]: { message: 'By continuing you accept', linkText: 't&c', link: 'https://www.adyen.com' }
            });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 16. hasHolderName
     */
    describe('Testing hasHolderName', () => {
        const ANALYTICS_DATA_PROP = 'hasHolderName';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 17. hasInstallmentOptions
     */
    describe('Testing installmentOptions prop and how it maps to a hasInstallmentOptions value', () => {
        const ANALYTICS_DATA_PROP = 'hasInstallmentOptions';
        const CARD_CONFIG_PROP = 'installmentOptions';

        test('Expect the prop, when installmentOptions is not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when installmentOptions is passed, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: { mc: { values: [1, 2] } } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 18. hasPlaceholders
     */
    describe('Testing placeholders prop and how it maps to a hasPlaceholders value', () => {
        const ANALYTICS_DATA_PROP = 'hasPlaceholders';
        const CARD_CONFIG_PROP = 'placeholders';

        test('Expect the prop, when placeholders is not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when placeholders is passed, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: { holderName: 'B Bob' } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 19. hasStylesConfigured
     */
    describe('Testing styles prop and how it maps to a hasStylesConfigured value', () => {
        const ANALYTICS_DATA_PROP = 'hasStylesConfigured';
        const CARD_CONFIG_PROP = 'styles';

        test('Expect the prop, when styles is not passed, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, when styles is passed, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: { base: { fontWeight: 300 } } });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 20. hideCVC
     */
    describe('Testing hideCVC', () => {
        const ANALYTICS_DATA_PROP = 'hideCVC';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 21. holderNameRequired
     */
    describe('Testing holderNameRequired', () => {
        const ANALYTICS_DATA_PROP = 'holderNameRequired';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 22. keypadFix
     */
    describe('Testing keypadFix', () => {
        const ANALYTICS_DATA_PROP = 'keypadFix';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 23. legacyInputMode
     */
    describe('Testing legacyInputMode', () => {
        const ANALYTICS_DATA_PROP = 'legacyInputMode';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 24. maskSecurityCode
     */
    describe('Testing maskSecurityCode', () => {
        const ANALYTICS_DATA_PROP = 'maskSecurityCode';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 25. minimumExpiryDate
     */
    describe('Testing minimumExpiryDate', () => {
        const ANALYTICS_DATA_PROP = 'minimumExpiryDate';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as a value, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: '01/26' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 26. name
     */
    describe('Testing name', () => {
        const ANALYTICS_DATA_PROP = 'name';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(null);
        });

        test('Expect the prop, passed as a value, to equal that value', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'CCard' });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('CCard');
        });
    });

    /**
     * 27. positionHolderNameOnTop
     */
    describe('Testing positionHolderNameOnTop', () => {
        const ANALYTICS_DATA_PROP = 'positionHolderNameOnTop';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 28. showBrandIcon
     */
    describe('Testing showBrandIcon', () => {
        const ANALYTICS_DATA_PROP = 'showBrandIcon'; // The name of the prop in the configData object sent to the analytics endpoint
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP; // The name of the prop in the Card configuration

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 29. showBrandsUnderCardNumber
     */
    describe('Testing showBrandsUnderCardNumber', () => {
        const ANALYTICS_DATA_PROP = 'showBrandsUnderCardNumber';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps[CARD_CONFIG_PROP]);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 30. showInstallmentAmounts
     */
    describe('Testing showInstallmentAmounts', () => {
        const ANALYTICS_DATA_PROP = 'showInstallmentAmounts';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal false', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 31. showKCPType
     */
    describe('Testing showKCPType', () => {
        const ANALYTICS_DATA_PROP = 'showKCPType';
        const CARD_CONFIG_PROP = 'countryCode';

        const configuration = { koreanAuthenticationRequired: true };

        test('Expect the prop, when not specifically set, to equal "none"', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });

        test('Expect the prop, when passed, to equal "auto", because countryCode is not "KR"', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'US', configuration });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('auto');
        });

        test('Expect the prop, when passed, to equal "atStart", because countryCode is "KR"', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'kr', configuration });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('atStart');
        });

        test('Expect the prop, when passed as false, to equal "none", even if countryCode is "KR"', () => {
            configuration.koreanAuthenticationRequired = false;
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: 'kr', configuration });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('none');
        });
    });

    /**
     * 32. showPayButton
     */
    // TODO - skip until endpoint can accept more entries in the configData object (current limit: 32);
    describe.skip('Testing showPayButton', () => {
        const ANALYTICS_DATA_PROP = 'showPayButton';
        const CARD_CONFIG_PROP = ANALYTICS_DATA_PROP;

        test('Expect the prop, when not specifically set, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as false, to equal false', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: false });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(false);
        });

        test('Expect the prop, passed as true, to equal true', () => {
            const configData = getCardConfigData({ ...defaultCardProps, [CARD_CONFIG_PROP]: true });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(true);
        });
    });

    /**
     * 33. socialSecurityNumberMode
     */
    // TODO - skip until endpoint can accept more entries in the configData object (current limit: 32);
    describe.skip('Testing socialSecurityNumberMode', () => {
        const ANALYTICS_DATA_PROP = 'socialSecurityNumberMode';

        const configuration: any = { socialSecurityNumberMode: 'show' };

        test('Expect the prop, when not passed, to equal the default', () => {
            const configData = getCardConfigData(defaultCardProps);
            expect(configData[ANALYTICS_DATA_PROP]).toEqual(CardDefaultProps.configuration.socialSecurityNumberMode);
        });

        test('Expect the prop, when passed as "show", to equal "show"', () => {
            const configData = getCardConfigData({ ...defaultCardProps, configuration });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('show');
        });

        test('Expect the prop, when passed as "hide", to equal "hide"', () => {
            configuration.socialSecurityNumberMode = 'hide';
            const configData = getCardConfigData({ ...defaultCardProps, configuration });
            expect(configData[ANALYTICS_DATA_PROP]).toEqual('hide');
        });
    });
});
