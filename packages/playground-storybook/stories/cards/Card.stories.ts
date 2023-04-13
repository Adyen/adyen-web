import { CardElementProps } from '@adyen/adyen-web/src/components/Card/types';
import { Meta, StoryObj } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type CardStory = StoryObj<PaymentMethodStoryProps<CardElementProps> & { txVariant: string }>;

const meta: Meta<PaymentMethodStoryProps<CardElementProps>> = {
    title: 'Cards/Card'
};
export default meta;

const createComponent = (args, context) => {
    const { txVariant = 'card', componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const cardContainer = document.createElement('div');
    const card = checkout.create(txVariant, {
        ...componentConfiguration
    });
    card.mount(cardContainer);
    addToWindow(card);
    return cardContainer;
};

export const Default: CardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true
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

export const WithInstallments: CardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            showBrandsUnderCardNumber: true,
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

export const BCMC: CardStory = {
    render: createComponent,
    args: {
        txVariant: 'bcmc',
        componentConfiguration: {
            _disableClickToPay: true
        }
    }
};

export const KCP: CardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
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
