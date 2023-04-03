import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import userEvent from '@testing-library/user-event';
import Language from '../../language';
import PayByBank from './PayByBank';

test('should return expected data to perform the payment', () => {
    const payByBankEle = new PayByBank({});
    expect(payByBankEle.formatData()).toEqual({ paymentMethod: { type: 'paybybank' } });
});

test('should show the pay button by default', async () => {
    const i18n = mock<Language>();
    i18n.get.mockImplementation(() => 'Continue to');
    i18n.loaded = Promise.resolve();

    const payByBankEle = new PayByBank({ name: 'Pay By Bank', i18n });
    render(payByBankEle.render());
    expect(await screen.findByRole('button', { name: 'Continue to Pay By Bank' })).toBeTruthy();
    expect(payByBankEle.props.showPayButton).toBeTruthy();
});

test('should hide pay button if property is set to false', () => {
    const payByBankEle = new PayByBank({ showPayButton: false });
    render(payByBankEle.render());
    expect(screen.queryByRole('button', { name: 'Continue to Pay By Bank' })).toBeFalsy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();
    const i18n = mock<Language>();
    i18n.get.mockImplementation(() => 'Continue to');
    i18n.loaded = Promise.resolve();

    const payByBankEle = new PayByBank({ showPayButton: true, name: 'Pay By Bank', i18n });
    payByBankEle.submit = jest.fn();
    render(payByBankEle.render());
    await user.click(await screen.findByRole('button', { name: 'Continue to Pay By Bank' }));
    expect(payByBankEle.submit).toHaveBeenCalledTimes(1);
});
