import { h, createContext, Fragment } from 'preact';
import { useContext, useEffect, useImperativeHandle, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren, RefObject } from 'preact';
import type { PaymentAmountExtended } from '../../types';

interface AmountProviderProps {
    amount: PaymentAmountExtended;
    secondaryAmount?: PaymentAmountExtended;
    providerRef: RefObject<AmountProviderRef>;
    children: ComponentChildren;
}

export interface AmountProviderRef {
    update(newAmount: PaymentAmountExtended, newSecondaryAmount?: PaymentAmountExtended): void;
}

const AmountContext = createContext<
    | {
          amount: PaymentAmountExtended;
          secondaryAmount?: PaymentAmountExtended;
      }
    | undefined
>(undefined);

const useAmount = (): PaymentAmountExtended => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }
    return context.amount;
};

const useSecondaryAmount = (): PaymentAmountExtended => {
    const context = useContext(AmountContext);
    if (!context) {
        throw new Error('useAmount must be used within an AmountProvider');
    }
    return context.secondaryAmount;
};

const AmountProvider = ({ amount, secondaryAmount, providerRef, children }: AmountProviderProps) => {
    const context = useContext(AmountContext);

    const [updatedAmount, setUpdatedAmount] = useState<PaymentAmountExtended>(amount);
    const [updatedSecondaryAmount, setUpdatedSecondaryAmount] = useState<PaymentAmountExtended>(secondaryAmount);

    useEffect(() => {
        setUpdatedAmount(amount);
    }, [amount]);

    useImperativeHandle(providerRef, () => ({
        update: (newAmount: PaymentAmountExtended, newSecondaryAmount?: PaymentAmountExtended) => {
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
