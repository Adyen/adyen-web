import { createAdvancedFlowCheckout } from '../helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../helpers/create-sessions-checkout';

export default {
    title: 'Card',
    argTypes: {
        useSessions: {
            defaultValue: 'true',
            control: 'boolean'
        },
        showPayButton: {
            defaultValue: 'true',
            control: 'boolean'
        }
    }
};

const createCard = (checkout, { componentConfiguration, txVariant = 'card', ...props }) => {
    const cardContainer = document.createElement('div');
    const card = checkout.create(txVariant, {
        ...componentConfiguration
    });
    card.mount(cardContainer);
    return cardContainer;
};

const Template = (props, { loaded: { checkout } }) => {
    return createCard(checkout, props);
};
export const Simple = Template.bind({});
Simple.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];

export const WithAVS = Template.bind({});
WithAVS.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];
WithAVS.args = {
    componentConfiguration: {
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

export const WithPartialAVS = Template.bind({});
WithPartialAVS.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];
WithPartialAVS.args = {
    componentConfiguration: {
        billingAddressRequired: true,
        billingAddressMode: 'partial'
    }
};

export const WithInstallments = Template.bind({});
WithInstallments.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];
WithInstallments.args = {
    componentConfiguration: {
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

export const BCMC = Template.bind({});
BCMC.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];
BCMC.args = {
    txVariant: 'bcmc'
};

export const KCP = Template.bind({});
KCP.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
        return { checkout };
    }
];
KCP.args = {
    componentConfiguration: {
        // Set koreanAuthenticationRequired AND countryCode so KCP fields show at start
        // Just set koreanAuthenticationRequired if KCP fields should only show if korean_local_card entered
        configuration: {
            koreanAuthenticationRequired: true
        },
        countryCode: 'KR'
    }
};

export const WithClickToPay = Template.bind({});
WithClickToPay.loaders = [
    async context => {
        const { useSessions, showPayButton } = context.args;
        const checkout = useSessions ? await createSessionsCheckout({ showPayButton }) : await createAdvancedFlowCheckout({ showPayButton });
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
