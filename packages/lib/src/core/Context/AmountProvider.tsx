import { h, createContext, Fragment } from 'preact';
import { useContext, useEffect, useImperativeHandle, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren, RefObject } from 'preact';
import type { PaymentAmount } from '../../types';

interface AmountProviderProps {
    amount: PaymentAmount;
    secondaryAmount?: PaymentAmount;
    providerRef: RefObject<AmountProviderRef>;
    children: ComponentChildren;
}

export interface AmountProviderRef {
    update(newAmount: PaymentAmount, newSecondaryAmount?: PaymentAmount): void;
}

const AmountContext = createContext<
    | {
          amount: PaymentAmount;
          secondaryAmount?: PaymentAmount;
      }
    | undefined
>(undefined);

const useAmount = (): PaymentAmount => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }
    return context.amount;
};

const useSecondaryAmount = (): PaymentAmount => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }
    return context.secondaryAmount;
};

const AmountProvider = ({ amount, secondaryAmount, providerRef, children }: AmountProviderProps) => {
    const context = useContext(AmountContext);

    const [updatedAmount, setUpdatedAmount] = useState<PaymentAmount>(amount);
    const [updatedSecondaryAmount, setUpdatedSecondaryAmount] = useState<PaymentAmount>(secondaryAmount);

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
