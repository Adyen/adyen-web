import { render, screen } from '@testing-library/preact';
import PayByBankUS from './PayByBankUS';
import userEvent from '@testing-library/user-event';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('PayByBank US', () => {
    let onSubmitMock;
    let user;

    beforeEach(() => {
        onSubmitMock = jest.fn();
        user = userEvent.setup();
    });

    test('should render payment description by default', async () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        render(pbb.render());
        expect(await screen.findByText(/Use Pay by Bank to pay/i)).toBeTruthy();
        expect(await screen.findByText(/By connecting your bank account/i)).toBeTruthy();
    });

    test('should render redirect button by default', async () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            onSubmit: onSubmitMock,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        render(pbb.render());
        const button = await screen.findByRole('button');
        expect(button).toHaveTextContent('Continue to');

        // check if button actually triggers submit
        await user.click(button);
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    test('should not render pay button if showPayButton is false', () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            onSubmit: onSubmitMock,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel },
            showPayButton: false
        });

        render(pbb.render());
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        // check if submit is still callables
        pbb.submit();
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    test('should not show disclaimer if is stored payment method', () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            storedPaymentMethodId: 'MOCK_ID',
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        render(pbb.render());
        expect(screen.queryByText(/Use Pay by Bank to pay/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/By connecting your bank account/i)).not.toBeInTheDocument();
    });

    test('should no show payButton with label Pay... if is stored payment method', () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            storedPaymentMethodId: 'MOCK_ID',
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        render(pbb.render());
        expect(screen.getByText(/Pay/i)).toBeInTheDocument();
    });

    test('should use label instead of payment method name if stored payment', () => {
        const core = setupCoreMock();

        const pbb = new PayByBankUS(core, {
            storedPaymentMethodId: 'MOCK_ID',
            label: 'Label mock',
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        expect(pbb.displayName).toBe('Label mock');
    });
});
