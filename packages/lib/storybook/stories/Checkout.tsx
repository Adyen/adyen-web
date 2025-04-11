import React from 'react';
import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { createCheckout } from '../helpers/create-checkout';
import { GlobalStoryProps } from './types';
import { ICore } from '../../src/core/types';
import Spinner from '../../src/components/internal/Spinner';

interface ICheckout {
    children: (checkout: ICore) => ComponentChildren | void;
    checkoutConfig: GlobalStoryProps;
}

export const Checkout: React.FC<ICheckout> = ({ children, checkoutConfig }) => {
    const [adyenCheckout, setAdyenCheckout] = useState<ICore>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        createCheckout(checkoutConfig)
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
