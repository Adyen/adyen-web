import { mount } from 'enzyme';
import { h } from 'preact';
import PaypalComponent from './PaypalComponent';

describe('PaypalComponent', () => {
    const getWrapper = (props?: object) => mount(<PaypalComponent onApprove={jest.fn()} {...props} />);

    test('Renders a loading spinner', async () => {
        const wrapper = getWrapper({ configuration: {} });
        expect(wrapper.find('.adyen-checkout__spinner')).toHaveLength(1);
    });
});
