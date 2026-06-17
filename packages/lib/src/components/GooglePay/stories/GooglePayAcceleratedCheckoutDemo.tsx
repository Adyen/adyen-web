import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import DropinElement from '../../Dropin';

import type { ICore } from '../../../core/types';

function moveGooglePayToTop(checkout: ICore): void {
    const pmList = checkout.paymentMethodsResponse.paymentMethods;
    const googlePayIndex = pmList.findIndex(pm => pm.type === 'googlepay' || pm.type === 'paywithgoogle');
    if (googlePayIndex > 0) {
        const [googlePay] = pmList.splice(googlePayIndex, 1);
        pmList.unshift(googlePay);
    }
}

export function GooglePayAcceleratedCheckoutDemo({ checkout }: Readonly<{ checkout: ICore }>) {
    const [dropin, setDropin] = useState<DropinElement>();

    useEffect(() => {
        moveGooglePayToTop(checkout);
        setDropin(new DropinElement(checkout));
    }, [checkout]);

    if (!dropin) {
        return <div>Loading...</div>;
    }

    return <ComponentContainer element={dropin} />;
}
