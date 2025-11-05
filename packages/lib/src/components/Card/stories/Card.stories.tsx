import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { CardConfiguration } from '../types';
import { searchFunctionExample } from '../../../../../playground/src/utils';
import { CardWith3DS2Redirect } from './cardStoryHelpers/CardWith3DS2Redirect';
import { createStoredCardComponent } from './cardStoryHelpers/createStoredCardComponent';
import { createCardComponent } from './cardStoryHelpers/createCardComponent';
import { getComponentConfigFromUrl } from '../../../../storybook/utils/get-configuration-from-url';
import { CardWith3DS2CreateFromAction } from './cardStoryHelpers/CardWith3DS2CreateFromAction';
import { AdditionalDetailsActions, AdditionalDetailsData } from '../../../core/types';
import { displayResultMessage } from '../../../../storybook/helpers/checkout-handlers';
import { makeDetailsCall } from '../../../../storybook/helpers/checkout-api-calls';

type CardStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Components/Cards/Card'
};

export const Default: CardStory = {
    render: createCardComponent,
    args: {
        srConfig: { moveFocus: true, showPanel: true },
        componentConfiguration: getComponentConfigFromUrl() ?? {
            _disableClickToPay: true,
            autoFocus: true,
            // brands: ['mc', 'synchrony_plcc'],
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

export const WithSSN: CardStory = {
    render: createCardComponent,
    args: {
        countryCode: 'BR',
        componentConfiguration: {
            _disableClickToPay: true,
            configuration: {
                socialSecurityNumberMode: 'show'
            }
        }
    }
};

export const WithAVS: CardStory = {
    render: createCardComponent,
    args: {
        srConfig: { moveFocus: true, showPanel: true },
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            billingAddressAllowedCountries: ['US', 'CA', 'GB'],
            //billingAddressRequiredFields: ['postalCode', 'country'],
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

export const WithKCP: CardStory = {
    render: createCardComponent,
    args: {
        countryCode: 'KR',
        componentConfiguration: {
            ...{ brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'korean_local_card'] },
            _disableClickToPay: true,
            // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
            // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
            configuration: {
                koreanAuthenticationRequired: true
            }
        }
    }
};

export const WithMockedFastlane: CardStory = {
    render: createCardComponent,
    args: {
        componentConfiguration: getComponentConfigFromUrl() ?? {
            fastlaneConfiguration: {
                showConsent: true,
                defaultToggleState: true,
                termsAndConditionsLink: 'https://adyen.com',
                privacyPolicyLink: 'https://adyen.com',
                termsAndConditionsVersion: 'v1',
                fastlaneSessionId: 'ABC-123'
            }
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

export const CardWith_3DS2_CreateFromAction: CardStory = {
    render: args => <CardWith3DS2CreateFromAction {...args} />,

    args: {
        componentConfiguration: {
            _disableClickToPay: true
        },
        useSessions: false
    }
};

export const CardWith_3DS2_own_onAdditionalDetails: CardStory = {
    render: createCardComponent,

    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            onAdditionalDetails(state: AdditionalDetailsData, _component, actions: AdditionalDetailsActions) {
                // Display in-between screen to demonstrate that *this* callback has been called, rather than the checkout level one
                displayResultMessage(true, 'success-own-onAdditionalDetails-called');

                setTimeout(async () => {
                    const container = document.getElementById('component-root');
                    const resMsg = document.querySelector('[data-testid="result-message"]');

                    // Go on to make the actual /details call in order to complete the flow
                    try {
                        const { resultCode, action, order, donationToken } = await makeDetailsCall(state.data);

                        if (!resultCode) actions.reject();

                        if (resMsg) container.removeChild(resMsg);

                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    } catch (error) {
                        console.error('## onAdditionalDetails - critical error', error);
                        actions.reject();
                    }
                }, 1000);
            }
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
