export interface SepaElementData {
    paymentMethod: {
        type: string;
        iban: string;
        ownerName: string;
    };
}
