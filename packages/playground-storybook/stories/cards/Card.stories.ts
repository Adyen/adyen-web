import { CardElementProps } from '@adyen/adyen-web/src/components/Card/types';
import { Meta, StoryFn } from '@storybook/html';
import { PaymentMethodStoryProps } from '../types';
import { addToWindow } from '../../utils/add-to-window';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type CardStoryProps = PaymentMethodStoryProps<CardElementProps> & {
    txVariant: string;
};

export default {
    title: 'Cards/Card'
} as Meta;

const Template: StoryFn<CardStoryProps> = ({ txVariant = 'card', componentConfiguration }, context): HTMLDivElement => {
    const checkout = getStoryContextCheckout(context);
    const cardContainer = document.createElement('div');
    const card = checkout.create(txVariant, {
        ...componentConfiguration
    });
    card.mount(cardContainer);
    addToWindow(card);
    return cardContainer;
};

export const Simple = Template.bind({}) as StoryFn<CardStoryProps>;

export const WithAVS = Template.bind({}) as StoryFn<CardStoryProps>;
WithAVS.args = {
    componentConfiguration: {
        // TODO: Make 'useClickToPay' prop optional in CardElementProps
        useClickToPay: false,
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
};

export const WithPartialAVS = Template.bind({}) as StoryFn<CardStoryProps>;
WithPartialAVS.args = {
    componentConfiguration: {
        // TODO: Make 'useClickToPay' prop optional in CardElementProps
        useClickToPay: false,
        billingAddressRequired: true,
        billingAddressMode: 'partial'
    }
};

export const WithInstallments = Template.bind({}) as StoryFn<CardStoryProps>;
WithInstallments.args = {
    componentConfiguration: {
        // TODO: Make 'useClickToPay' prop optional in CardElementProps
        useClickToPay: false,
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
};

export const BCMC = Template.bind({}) as StoryFn<CardStoryProps>;
BCMC.args = {
    txVariant: 'bcmc'
};

export const KCP = Template.bind({}) as StoryFn<CardStoryProps>;
KCP.args = {
    componentConfiguration: {
        // TODO: Make 'useClickToPay' prop optional in CardElementProps
        useClickToPay: false,
        // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
        // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
        configuration: {
            koreanAuthenticationRequired: true
        },
        countryCode: 'KR'
    }
};

export const WithClickToPay = Template.bind({}) as StoryFn<CardStoryProps>;
WithClickToPay.args = {
    componentConfiguration: {
        useClickToPay: true,
        clickToPayConfiguration: {
            shopperIdentityValue: 'gui.ctp@adyen.com',
            merchantDisplayName: 'Adyen Merchant Name '
        }
    }
};
