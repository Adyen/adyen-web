import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PayByBank from './PayByBank';

test('should return expected data to perform the payment', () => {
    const payByBankEle = new PayByBank(global.core, { loadingContext: 'test', modules: { resources: global.resources } });
    expect(payByBankEle.formatData()).toEqual({ paymentMethod: { type: 'paybybank' } });
});

test('should show the pay button by default', async () => {
    const payByBankEle = new PayByBank(global.core, {
        name: 'Pay By Bank',
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(payByBankEle.render());
    expect(await screen.findByRole('button', { name: 'Continue to Pay By Bank' })).toBeTruthy();
    expect(payByBankEle.props.showPayButton).toBeTruthy();
});

test('should hide pay button if property is set to false', () => {
    const payByBankEle = new PayByBank(global.core, {
        showPayButton: false,
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(payByBankEle.render());
    expect(screen.queryByRole('button', { name: 'Continue to Pay By Bank' })).toBeFalsy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();

    const payByBankEle = new PayByBank(global.core, {
        name: 'Pay By Bank',
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    payByBankEle.submit = jest.fn();
    render(payByBankEle.render());
    await user.click(await screen.findByRole('button', { name: 'Continue to Pay By Bank' }));
    expect(payByBankEle.submit).toHaveBeenCalledTimes(1);
});
