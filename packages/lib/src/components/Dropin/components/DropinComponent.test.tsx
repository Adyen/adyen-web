import { render, screen, waitFor } from '@testing-library/preact';
import DropinDefaultProps from '../defaultProps';
import DropinComponent from './DropinComponent';
import { ComponentChildren, h } from 'preact';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { mock } from 'jest-mock-extended';
import { ICore } from '../../../core/types';
import RedirectElement from '../../Redirect';
import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';

const customRender = (children: ComponentChildren) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {children}
        </CoreProvider>
    );
};

test('should pre-select payment method if it is specified', async () => {
    const paymentMethodsResponse = new PaymentMethods({
        paymentMethods: [
            { type: 'ideal', name: 'iDEAL' },
            { type: 'kakaopay', name: 'KakaoPay' },
            { type: 'alipay', name: 'AliPay' }
        ]
    });

    const core = mock<ICore>();
    core.paymentMethodsResponse = paymentMethodsResponse;

    const onCreateElementsMock = () => [
        Promise.resolve([]),
        Promise.resolve([
            new RedirectElement(core, { type: 'kakaopay', icon: 'kakaopay', i18n: global.i18n }),
            new RedirectElement(core, { type: 'alipay', icon: 'alipay', i18n: global.i18n }),
            new RedirectElement(core, { type: 'ideal', icon: 'ideal', i18n: global.i18n })
        ]),
        Promise.resolve([])
    ];

    customRender(
        <DropinComponent core={core} openPaymentMethod={{ type: 'ideal' }} onCreateElements={onCreateElementsMock} {...DropinDefaultProps} />
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /continue to ideal/i, exact: false })).toBeVisible());
});
