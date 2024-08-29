import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CardConfiguration } from '../../../src/components/Card/types';
import Card from '../../../src/components/Card';
import { Container } from '../Container';
import { searchFunctionExample } from '../../../../playground/src/utils';
import { CardWith3DS2Redirect } from './cardStoryHelpers/CardWith3DS2Redirect';
import './cardStoryHelpers/storedCard.style.scss';

type CardStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Card'
};

const createComponent = (args: PaymentMethodStoryProps<CardConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = args;
    //globalThis.card = card;
    //globalThis.parent.window['card'] = card;
    return <Container Element={Card} checkoutConfig={checkoutConfig} componentConfig={componentConfiguration} />;
};

const createStoredCardComponent = (args: PaymentMethodStoryProps<CardConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);

    if (checkout.paymentMethodsResponse.storedPaymentMethods && checkout.paymentMethodsResponse.storedPaymentMethods.length > 0) {
        // We are only interested in card based storedPaymentMethods that support Ecommerce  - a quick way to distinguish these is if they have a brand property
        let storedCardData;
        let storedPM;
        for (let i = 0; i < checkout.paymentMethodsResponse.storedPaymentMethods.length; i++) {
            storedPM = checkout.paymentMethodsResponse.storedPaymentMethods[i];
            if (storedPM.brand && storedPM.supportedShopperInteractions.includes('Ecommerce')) {
                storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[i];
                break; // exit, now we've found the first storedCard
            }
        }

        if (storedCardData) {
            const card = new Card(checkout, { ...storedCardData, ...componentConfiguration });

            return (
                <div>
                    <div className={'stored-card-info'}>
                        <p>
                            <i>Stored card info:</i>
                        </p>
                        <div className={'info-container'}>
                            <div>
                                <div>Brand:</div>
                                <img src={card.icon} alt={'stored-card-brand-icon'} />
                            </div>
                            <div className={'info-extra-item'}>
                                <div>Last four digits:</div>
                                <div className={'info-item-with-top-margin'}>{storedPM.lastFour}</div>
                            </div>
                            <div className={'info-extra-item'}>
                                <div>Holder name:</div>
                                <div className={'info-item-with-top-margin'}>{storedPM.holderName}</div>
                            </div>
                        </div>
                    </div>
                    <Container element={card} />
                </div>
            );
        } else {
            return <div>No stored cards found</div>;
        }
    } else {
        return <div>No stored payment methods found</div>;
    }
};

export const Default: CardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            autoFocus: false,
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
    render: createComponent,
    args: {
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
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            billingAddressMode: 'partial'
        }
    }
};

export const WithAVSAddressLookup: CardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            onAddressLookup: searchFunctionExample
        }
    }
};

export const WithInstallments: CardStory = {
    render: createComponent,
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
    render: createComponent,
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
    render: createComponent,
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
