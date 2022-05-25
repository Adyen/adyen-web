import { createContext } from 'preact';

const ClickToPayContext = createContext({
    ctpState: null,
    cards: [],
    otpMaskedContact: null,
    checkout: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
