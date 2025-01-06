import { render, screen, waitFor } from '@testing-library/preact';
import KlarnaPayments from './KlarnaPayments';
import Dropin from '../Dropin';
import { PaymentAction } from '../../types/global-types';

describe('KlarnaPayments', () => {
    const coreProps = {
        name: 'Klarna',
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources, analytics: global.analytics }
    };
    const renderKlarna = props => {
        const KlarnaPaymentsEle = new KlarnaPayments(global.core, {
            ...coreProps,
            ...props
        });
        render(KlarnaPaymentsEle.render());
    };

    test('should show the pay button by default', async () => {
        renderKlarna({ paymentData: '', paymentMethodType: '', sdkData: undefined, useKlarnaWidget: false });
        expect(await screen.findByRole('button', { name: 'Continue to Klarna' })).toBeTruthy();
    });

    test('should hide pay button if sets to false', () => {
        renderKlarna({ paymentData: '', paymentMethodType: '', sdkData: undefined, useKlarnaWidget: false, showPayButton: false });
        expect(screen.queryByRole('button', { name: 'Continue to Pay By Bank' })).toBeFalsy();
    });

    test('should call setStatus if elementRef is a drop-in', async () => {
        const klarna = new KlarnaPayments(global.core, {
            ...coreProps
        });
        klarna.elementRef = new Dropin(global.core);
        render(klarna.render());

        const spy = jest.spyOn(klarna.elementRef, 'setStatus');
        await waitFor(() => klarna.componentRef);

        // @ts-ignore to test
        klarna.onLoaded();

        expect(spy).toHaveBeenCalled();
    });

    test('should call handleAdditionalDetails onComplete', async () => {
        const onAdditionalDetailsMock = jest.fn(() => {});
        const klarna = new KlarnaPayments(global.core, {
            ...coreProps,
            onAdditionalDetails: onAdditionalDetailsMock
        });

        render(klarna.render());
        await waitFor(() => klarna.componentRef);

        // @ts-ignore to test
        klarna.onComplete();

        expect(onAdditionalDetailsMock).toHaveBeenCalled();
    });

    describe('when handling action', () => {
        test('should use updateWithAction when action type is "sdk"', async () => {
            const widgetAction: PaymentAction = {
                paymentData: 'Ab02b4c0!...',
                paymentMethodType: 'klarna_paynow',
                type: 'sdk',
                sdkData: {
                    client_token: 'eyJhbGciOiJ...',
                    payment_method_category: 'pay_over_time'
                }
            };

            const klarna = new KlarnaPayments(global.core, {
                ...coreProps,
                type: 'klarna_paynow',
                onSubmit(state, component, actions) {
                    actions.resolve({
                        resultCode: 'Pending',
                        action: widgetAction
                    });
                }
            });
            const spy = jest.spyOn(klarna, 'updateWithAction');

            render(klarna.render());
            klarna.submit();

            await waitFor(() => expect(spy).toHaveBeenCalledWith(widgetAction), { interval: 100 });
        });

        test('should NOT use updateWithAction when action type is NOT "sdk"', done => {
            const action: PaymentAction = {
                paymentMethodType: 'klarna_paynow',
                type: 'redirect',
                url: 'https://checkoutshopper-test.adyen.com/checkoutshopper/checkoutPaymentRedirect?redirectData=X3XtfGC9%21H4s...',
                method: 'GET'
            };

            const klarna = new KlarnaPayments(global.core, {
                ...coreProps,
                type: 'klarna_paynow',
                onSubmit(state, component, actions) {
                    actions.resolve({
                        resultCode: 'Pending',
                        action
                    });
                }
            });
            const spy = jest.spyOn(klarna, 'updateWithAction');

            render(klarna.render());
            klarna.submit();

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            }, 500);
        });
    });
});
