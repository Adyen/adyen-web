import { createContext } from 'preact';

const ClickToPayContext = createContext({
    ctpState: null,
    cards: [],
    otpMaskedContact: null,
    startIdentityValidation: null,
    finishIdentityValidation: null
});

export { ClickToPayContext };
