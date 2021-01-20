export default interface SepaElementData {
    paymentMethod: {
        type: string;
        iban?: string;
        ownerName?: string;
        canModifyCountryCode?: boolean;
    };
}
