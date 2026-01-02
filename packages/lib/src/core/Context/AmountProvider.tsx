import { h, createContext, Fragment } from 'preact';
import { useContext, useEffect, useImperativeHandle, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren, RefObject } from 'preact';
import type { PaymentAmount } from '../../types';
import { isAmountValid } from '../../utils/amount-util';

interface AmountContextValue {
    amount?: PaymentAmount;
    secondaryAmount?: PaymentAmount;
}

export interface AmountProviderProps {
    amount?: PaymentAmount;
    secondaryAmount?: PaymentAmount;
    providerRef: RefObject<AmountProviderRef>;
    children: ComponentChildren;
}

export interface AmountProviderRef {
    update(newAmount: PaymentAmount, newSecondaryAmount?: PaymentAmount): void;
}

const AmountContext = createContext<AmountContextValue | undefined>(undefined);

const useAmount = (): { amount: PaymentAmount | undefined; isZeroAuth: boolean; isAmountValid: boolean } => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }

    return {
        amount: context.amount,
        isZeroAuth: context.amount?.value === 0,
        isAmountValid: isAmountValid(context.amount)
    };
};

const useSecondaryAmount = (): { secondaryAmount: PaymentAmount | undefined } => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }
    return { secondaryAmount: context.secondaryAmount };
};

const AmountProvider = ({ amount, secondaryAmount, providerRef, children }: AmountProviderProps) => {
    const context = useContext(AmountContext);

    const [updatedAmount, setUpdatedAmount] = useState<PaymentAmount>(amount);
    const [updatedSecondaryAmount, setUpdatedSecondaryAmount] = useState<PaymentAmount | undefined>(secondaryAmount);

    useEffect(() => {
        setUpdatedAmount(amount);
    }, [amount]);

    useImperativeHandle(providerRef, () => ({
        update: (newAmount: PaymentAmount, newSecondaryAmount?: PaymentAmount) => {
            setUpdatedAmount(newAmount);
            setUpdatedSecondaryAmount(newSecondaryAmount);
        }
    }));

    const contextValue = useMemo(() => ({ amount: updatedAmount, secondaryAmount: updatedSecondaryAmount }), [updatedAmount, updatedSecondaryAmount]);

    if (context) {
        return <Fragment>{children}</Fragment>;
    }

    return <AmountContext.Provider value={contextValue}>{children}</AmountContext.Provider>;
};

export { AmountProvider, useAmount, useSecondaryAmount };
