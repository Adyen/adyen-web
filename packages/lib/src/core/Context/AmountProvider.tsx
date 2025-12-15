import { ComponentChildren, createContext, Fragment, h, Ref, RefObject, toChildArray } from 'preact';
import { PaymentAmount } from '../../types';
import { useContext, useImperativeHandle, useState } from 'preact/hooks';

interface AmountProviderProps {
    amount: PaymentAmount;
    ref: RefObject<AmountProviderRef>;
    children: ComponentChildren;
}

export interface AmountProviderRef {
    update: (newAmount: PaymentAmount) => void;
}

type ContextValue = {
    amount: PaymentAmount;
};

const AmountContext = createContext<ContextValue | undefined>(undefined);

const AmountProvider = ({ amount, ref, children }: AmountProviderProps) => {
    const context = useContext(AmountContext);
    const [updatedAmount, setUpdatedAmount] = useState<PaymentAmount>(amount);

    useImperativeHandle(ref, () => ({
        update: (newAmount: PaymentAmount) => {
            setUpdatedAmount(newAmount);
        }
    }));

    if (context) {
        return <Fragment>{toChildArray(children)}</Fragment>;
    }

    return <AmountContext.Provider value={{ amount: updatedAmount }}>{toChildArray(children)}</AmountContext.Provider>;
};

export { AmountProvider };
