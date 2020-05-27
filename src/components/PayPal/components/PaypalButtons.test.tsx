import { h } from 'preact';
import { mount } from 'enzyme';
import PaypalButtons from './PaypalButtons';

const isEligible = jest.fn(() => true);
const render = jest.fn(() => Promise.resolve());

const paypalRefMock = {
    FUNDING: {
        PAYPAL: 'paypal',
        CREDIT: 'credit'
    },
    Buttons: jest.fn(() => ({ isEligible, render }))
};

describe('PaypalButtons', () => {
    const getWrapper = (props?: object) => mount(<PaypalButtons {...props} paypalRef={paypalRefMock} />);

    test('Calls to paypalRef.Buttons', async () => {
        jest.clearAllMocks();
        const wrapper = getWrapper();
        wrapper.update();
        expect(paypalRefMock.Buttons).toHaveBeenCalledTimes(2);
    });

    test('Calls to paypalRef.Buttons().render', async () => {
        jest.clearAllMocks();
        const wrapper = getWrapper();
        wrapper.update();
        expect(paypalRefMock.Buttons().render).toHaveBeenCalledTimes(2);
    });
});
