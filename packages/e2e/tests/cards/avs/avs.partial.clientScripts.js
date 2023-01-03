const CLIENTSCRIPT_PARTIAL_AVS_WITH_COUNTRY = `
    window.cardConfig = {
        billingAddressRequired: true,
        billingAddressMode: 'partial',
        data: {
            billingAddress: {
                country: 'BR'
            }
        }    
    };
`;

const CLIENTSCRIPT_PARTIAL_AVS_WITHOUT_COUNTRY = `
    window.cardConfig = {
        billingAddressRequired: true,
        billingAddressMode: 'partial'
    };
`;

export { CLIENTSCRIPT_PARTIAL_AVS_WITH_COUNTRY, CLIENTSCRIPT_PARTIAL_AVS_WITHOUT_COUNTRY };
