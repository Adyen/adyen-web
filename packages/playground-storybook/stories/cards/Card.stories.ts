import { CardElementProps } from '@adyen/adyen-web/src/components/Card/types';
import { Meta, StoryFn } from '@storybook/html';
import { GlobalStoryProps } from '../types';
import { createCheckout } from '../../helpers/create-checkout';

type CardStoryProps = GlobalStoryProps & {
    txVariant: string;
    componentConfiguration: CardElementProps;
};

export default {
    title: 'Cards/Card'
} as Meta;

const Template: StoryFn<CardStoryProps> = ({ txVariant = 'card', componentConfiguration }, { loaded: { checkout } }): HTMLDivElement => {
    const cardContainer = document.createElement('div');
    const card = checkout.create(txVariant, {
        ...componentConfiguration
    });
    card.mount(cardContainer);
    return cardContainer;
};

export const Simple = Template.bind({}) as StoryFn<CardStoryProps>;
Simple.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];

export const WithAVS = Template.bind({}) as StoryFn<CardStoryProps>;
WithAVS.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
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
WithPartialAVS.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
WithPartialAVS.args = {
    componentConfiguration: {
        // TODO: Make 'useClickToPay' prop optional in CardElementProps
        useClickToPay: false,
        billingAddressRequired: true,
        billingAddressMode: 'partial'
    }
};

export const WithInstallments = Template.bind({}) as StoryFn<CardStoryProps>;
WithInstallments.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
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
BCMC.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
BCMC.args = {
    txVariant: 'bcmc'
};

export const KCP = Template.bind({}) as StoryFn<CardStoryProps>;
KCP.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
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
WithClickToPay.loaders = [
    async context => {
        const checkout = await createCheckout(context);
        return { checkout };
    }
];
WithClickToPay.args = {
    componentConfiguration: {
        useClickToPay: true,
        clickToPayConfiguration: {
            shopperIdentityValue: 'gui.ctp@adyen.com',
            merchantDisplayName: 'Adyen Merchant Name '
        }
    }
};
