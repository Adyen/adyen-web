import React from 'react';
import { useEffect, useState } from 'preact/hooks';
import { createCheckout } from '../helpers/create-checkout';
import Spinner from '../../src/components/internal/Spinner';

import type { ComponentChildren } from 'preact';
import type { GlobalStoryProps, ShopperDetails } from './types';
import type { ICore } from '../../src/core/types';

interface ICheckout {
    children: (checkout: ICore) => ComponentChildren | void;
    checkoutConfig: GlobalStoryProps;
    shopperDetails?: ShopperDetails;
}

export const Checkout: React.FC<ICheckout> = ({ children, checkoutConfig, shopperDetails }) => {
    const [adyenCheckout, setAdyenCheckout] = useState<ICore>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        createCheckout(checkoutConfig, shopperDetails)
            .then(checkout => {
                setAdyenCheckout(checkout);
            })
            .catch(e => {
                console.error(e);
                setErrorMessage('Initialize checkout failed.');
            });
    }, [checkoutConfig]);

    return (
        <>
            {errorMessage && <div>{errorMessage}</div>}
            {adyenCheckout ? children(adyenCheckout) : <Spinner />}
        </>
    );
};
