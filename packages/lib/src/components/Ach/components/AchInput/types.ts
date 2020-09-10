export interface ACHInputStateValid {
    holderName?: boolean;
    billingAddress?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}

export interface ACHInputStateError {
    holderName?: boolean;
    billingAddress?: boolean;
    encryptedBankAccountNumber?: boolean;
    encryptedBankLocationId?: boolean;
}
