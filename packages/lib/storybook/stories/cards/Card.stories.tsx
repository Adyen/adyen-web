import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CardElementProps } from '../../../src/components/Card/types';
import { Card } from '../../../src';
import { Container } from '../Container';

type CardStory = StoryConfiguration<CardElementProps>;

const meta: MetaConfiguration<CardElementProps> = {
    title: 'Cards/Card'
};

const createComponent = (args: PaymentMethodStoryProps<CardElementProps>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const card = new Card({ core: checkout, ...componentConfiguration });

    return <Container element={card} />;
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

export default meta;
