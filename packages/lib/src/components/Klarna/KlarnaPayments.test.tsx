import { render, screen, waitFor } from '@testing-library/preact';
import KlarnaPayments from './KlarnaPayments';
import Dropin from '../Dropin';

describe('KlarnaPayments', () => {
    const coreProps = { name: 'Klarna', i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } };
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
});
