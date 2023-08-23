import { mount } from 'enzyme';
import { h } from 'preact';
import IssuerList from './IssuerList';
import PayButton from '../PayButton';

describe('IssuerList', () => {
    test('Accepts Items as props', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const wrapper = mount(
            <IssuerList
                items={items}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );
        expect(wrapper.props().items).toHaveLength(3);
        expect(wrapper.find('ul li')).toHaveLength(3);
    });

    test('Renders highlighted issuers button group', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );
        expect(wrapper.props().highlightedIds).toHaveLength(2);
        expect(wrapper.find('.adyen-checkout__issuer-button-group button')).toHaveLength(2);
    });

    test('Clicking in a highlighted issuer trigger onChange callback', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];
        const onChangeCb = jest.fn();

        expect(onChangeCb).toBeCalledTimes(0);

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={onChangeCb}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );

        let callbackData = { data: { issuer: null }, valid: { issuer: false }, errors: { issuer: null }, isValid: false };

        expect(onChangeCb).toBeCalledTimes(2);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);
        expect(onChangeCb.mock.calls[1][0]).toStrictEqual(callbackData);

        wrapper.find('.adyen-checkout__issuer-button-group button').at(1).simulate('click');

        callbackData = { data: { issuer: '3' }, valid: { issuer: true }, errors: { issuer: null }, isValid: true };

        expect(onChangeCb).toBeCalledTimes(3);
        expect(onChangeCb.mock.calls[2][0]).toStrictEqual(callbackData);
    });

    test('UI should not render invalid highlighted issuers', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['3', '4', '5'];

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );

        const highlightedButtons = wrapper.find('.adyen-checkout__issuer-button-group button');

        expect(highlightedButtons).toHaveLength(1);
        expect(highlightedButtons.at(0).text()).toBe('Issuer 3');
    });

    test('Highlighted issuer is rendered as Button and as part of the dropdown', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['3'];

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );

        const highlightedIssuerButton = wrapper.find('.adyen-checkout__issuer-button-group button').at(0);
        const highlightedIssuerDropdownItem = wrapper.find('ul li').at(2);

        expect(highlightedIssuerButton.text()).toBe(highlightedIssuerDropdownItem.text());
        expect(highlightedIssuerButton.prop('value')).toBe(highlightedIssuerDropdownItem.prop('data-value'));
    });

    test('Highlight all issuers removes dropdown and renders all issuers regardless of highlightedIds', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' },
            { name: 'Issuer 3', id: '4' },
            { name: 'Issuer 5', id: '5' }
        ];
        const highlightedIds = ['3'];

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                highlightAllIssuersAndHideDropdown
            />
        );

        const highlightedIssuers = wrapper.find('.adyen-checkout__issuer-button-group button');
        const highlightedContentSeparator = wrapper.find('.adyen-checkout__content-separator');
        const dropdownElement = wrapper.find('.adyen-checkout__field--issuer-list');

        expect(highlightedContentSeparator.exists()).toBeFalsy();
        expect(dropdownElement.exists()).toBeFalsy();
        expect(highlightedIssuers).toHaveLength(5);
    });
});
