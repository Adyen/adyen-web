import { render, screen, waitFor } from '@testing-library/preact';
import KlarnaPayments from './KlarnaPayments';
import DropinElement from '../Dropin';

describe('KlarnaPayments', () => {
    const coreProps = { name: 'Klarna', i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } };
    const renderKlarna = props => {
        const KlarnaPaymentsEle = new KlarnaPayments({
            ...coreProps,
            ...props
        });
        render(KlarnaPaymentsEle.render());
    };

    test('should show the pay button if sets to true', async () => {
        renderKlarna({ paymentData: '', paymentMethodType: '', sdkData: undefined, useKlarnaWidget: false, showPayButton: true });
        expect(await screen.findByRole('button', { name: 'Continue to Klarna' })).toBeTruthy();
    });

    test('should hide pay button if sets to false', () => {
        renderKlarna({ paymentData: '', paymentMethodType: '', sdkData: undefined, useKlarnaWidget: false, showPayButton: false });
        expect(screen.queryByRole('button', { name: 'Continue to Pay By Bank' })).toBeFalsy();
    });

    test('should call setStatus if elementRef is a drop-in', async () => {
        const KlarnaPaymentsEle = new KlarnaPayments({
            ...coreProps,
            ...{ paymentData: '', paymentMethodType: '', sdkData: undefined, useKlarnaWidget: false, showPayButton: false }
        });
        KlarnaPaymentsEle.elementRef = new DropinElement({ paymentMethods: [] });
        render(KlarnaPaymentsEle.render());
        const spy = jest.spyOn(KlarnaPaymentsEle.elementRef, 'setStatus');
        // @ts-ignore to test
        await waitFor(() => KlarnaPaymentsEle.componentRef);
        // @ts-ignore to test
        KlarnaPaymentsEle.componentRef.props.onReady();
        expect(spy).toHaveBeenCalled();
    });

    test('should call handleAdditionalDetails onComplete', async () => {
        const onAdditionalDetailsMock = jest.fn(() => {});

        const KlarnaPaymentsEle = new KlarnaPayments({
            ...coreProps,
            ...{
                paymentData: '',
                paymentMethodType: '',
                sdkData: undefined,
                useKlarnaWidget: false,
                showPayButton: false,
                onAdditionalDetails: onAdditionalDetailsMock
            }
        });
        render(KlarnaPaymentsEle.render());
        // @ts-ignore to test
        await waitFor(() => KlarnaPaymentsEle.componentRef);
        // @ts-ignore to test
        KlarnaPaymentsEle.componentRef.props.onComplete();
        expect(onAdditionalDetailsMock).toHaveBeenCalled();
    });
});
