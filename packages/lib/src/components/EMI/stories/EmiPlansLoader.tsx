import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Spinner from '../../internal/Spinner';
import { getEmiPlans } from '../../../../storybook/helpers/checkout-api-calls';
import type { ComponentChildren } from 'preact';
import type { PaymentAmount } from '../../../types/global-types';
import type { EmiPlansResponse } from '../types';

interface EmiPlansLoaderProps {
    amount: PaymentAmount;
    children(plans?: EmiPlansResponse): ComponentChildren;
}

/**
 * Stands in for the merchant backend: the plans exist before the component does. `Checkout` resolves the
 * core asynchronously but knows nothing about EMI, so the fetch lives here instead.
 */
export function EmiPlansLoader({ amount, children }: Readonly<EmiPlansLoaderProps>) {
    const [state, setState] = useState<{ isLoading: boolean; plans?: EmiPlansResponse }>({ isLoading: true });

    useEffect(() => {
        getEmiPlans(amount)
            .then(plans => setState({ isLoading: false, plans }))
            .catch(error => {
                console.error('Fetching EMI plans failed', error);
                setState({ isLoading: false });
            });
    }, [amount.value, amount.currency]);

    return <Fragment>{state.isLoading ? <Spinner /> : children(state.plans)}</Fragment>;
}
