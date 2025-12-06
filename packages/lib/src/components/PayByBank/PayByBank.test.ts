import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PayByBank from './PayByBank';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

test('should return expected data to perform the payment', () => {
    const core = setupCoreMock();

    const payByBank = new PayByBank(core, { loadingContext: 'test', modules: { resources: global.resources } });
    expect(payByBank.formatData()).toEqual({ paymentMethod: { type: 'paybybank' } });
});

test('should show the pay button by default', async () => {
    const core = setupCoreMock();

    const payByBank = new PayByBank(core, {
        name: 'Pay By Bank',
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(payByBank.render());
    expect(await screen.findByRole('button', { name: 'Continue to Pay By Bank' })).toBeTruthy();
    expect(payByBank.props.showPayButton).toBeTruthy();
});

test('should hide pay button if property is set to false', () => {
    const core = setupCoreMock();

    const payByBank = new PayByBank(core, {
        showPayButton: false,
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(payByBank.render());
    expect(screen.queryByRole('button', { name: 'Continue to Pay By Bank' })).toBeFalsy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();
    const core = setupCoreMock();

    const payByBank = new PayByBank(core, {
        name: 'Pay By Bank',
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    payByBank.submit = jest.fn();
    render(payByBank.render());
    await user.click(await screen.findByRole('button', { name: 'Continue to Pay By Bank' }));
    expect(payByBank.submit).toHaveBeenCalledTimes(1);
});
