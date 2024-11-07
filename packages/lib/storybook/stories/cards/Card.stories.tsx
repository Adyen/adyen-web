import { MetaConfiguration, StoryConfiguration } from '../types';
import { CardConfiguration } from '../../../src/components/Card/types';
import { searchFunctionExample } from '../../../../playground/src/utils';
import { CardWith3DS2Redirect } from './cardStoryHelpers/CardWith3DS2Redirect';
import { createStoredCardComponent } from './cardStoryHelpers/createStoredCardComponent';
import { createCardComponent } from './cardStoryHelpers/createCardComponent';
import { getComponentConfigFromUrl } from '../../utils/get-configuration-from-url';

type CardStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Card'
};

export const Default: CardStory = {
    render: createCardComponent,
    args: {
        srConfig: { moveFocus: true },
        componentConfiguration: getComponentConfigFromUrl() ?? {
            _disableClickToPay: true,
            autoFocus: true,
            // brands: ['mc'],
            // brandsConfiguration: { visa: { icon: 'http://localhost:3000/nocard.svg', name: 'altVisa' } },
            challengeWindowSize: '02',
            // configuration: {socialSecurityNumberMode: 'auto'}
            // data: {
            //     holderName: 'J. Smith'
            // },
            disableIOSArrowKeys: false,
            // disclaimerMessage,
            // doBinLookup: false,
            enableStoreDetails: false,
            // exposeExpiryDate: true,
            forceCompat: false,
            hasHolderName: false,
            holderNameRequired: false,
            hideCVC: false,
            // keypadFix: false,
            legacyInputMode: false,
            maskSecurityCode: false,
            minimumExpiryDate: null, // e.g. '11/24'
            // name: '', // Affects Dropin only
            placeholders: {}, // e.g. { holderName: 'B Bob' }
            positionHolderNameOnTop: false,
            showBrandIcon: true,
            showContextualElement: true
            // showPayButton: false,
            // styles: { base: { fontWeight: 300 } },
        }
    }
};

export const WithAVS: CardStory = {
    render: createCardComponent,
    args: {
        srConfig: { showPanel: false },
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            billingAddressAllowedCountries: ['US', 'CA', 'GB'],
            // billingAddressRequiredFields: ['postalCode', 'country'],
            data: {
                billingAddress: {
                    street: 'Virginia Street',
                    postalCode: '95014',
                    city: 'Cupertino',
                    houseNumberOrName: '1',
                    country: 'US',
                    stateOrProvince: 'CA'
                }
            }
        }
    }
};

export const WithPartialAVS: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            billingAddressMode: 'partial'
        }
    }
};

export const WithAVSAddressLookup: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            onAddressLookup: searchFunctionExample
        }
    }
};

export const WithInstallments: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            showInstallmentAmounts: true,
            installmentOptions: {
                mc: {
                    values: [1, 2, 3]
                },
                visa: {
                    values: [1, 2, 3, 4],
                    plans: ['regular', 'revolving']
                }
            }
        }
    }
};

export const KCP: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: {
            ...{ brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'korean_local_card'] },
            _disableClickToPay: true,
            // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
            // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
            configuration: {
                koreanAuthenticationRequired: true
            },
            countryCode: 'KR'
        }
    }
};

export const WithClickToPay: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: {
            clickToPayConfiguration: {
                shopperEmail: 'gui.ctp@adyen.com',
                merchantDisplayName: 'Adyen Merchant Name'
            }
        }
    }
};

export const CardWith_3DS2_Redirect: CardStory = {
    render: args => <CardWith3DS2Redirect {...args} />,

    args: {
        componentConfiguration: {
            _disableClickToPay: true
        },
        useSessions: false
    }
};

export const StoredCard: CardStory = {
    render: createStoredCardComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            hideCVC: false
        }
    }
};

export default meta;
