import { createContext } from 'preact';

const ClickToPayContext = createContext({
    ctpState: null,
    cards: [],
    otpMaskedContact: null,
    doCheckout: null,
    startIdentityValidation: null,
    onFinishIdentityValidation: null
});

export { ClickToPayContext };
