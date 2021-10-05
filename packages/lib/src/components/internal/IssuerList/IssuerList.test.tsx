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

    test('Renders predefined issuers button group', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];

        const predefinedIssuers = [
            { name: 'Issuer 4', id: '4' },
            { name: 'Issuer 5', id: '5' }
        ];
        const wrapper = mount(
            <IssuerList
                items={items}
                predefinedIssuers={predefinedIssuers}
                showPayButton={false}
                onChange={jest.fn()}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );
        expect(wrapper.props().predefinedIssuers).toHaveLength(2);
        expect(wrapper.find('.adyen-checkout__issuer-button-group button')).toHaveLength(2);
    });

    test('Clicking in a predefined issuers trigger onChange callback', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];

        const predefinedIssuers = [
            { name: 'Issuer 4', id: '4' },
            { name: 'Issuer 5', id: '5' }
        ];

        const onChangeCb = jest.fn();

        expect(onChangeCb).toBeCalledTimes(0);

        const wrapper = mount(
            <IssuerList
                items={items}
                predefinedIssuers={predefinedIssuers}
                showPayButton={false}
                onChange={onChangeCb}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
            />
        );

        let callbackData = { data: { issuer: null }, valid: { issuer: false }, errors: { issuer: null }, isValid: false };

        expect(onChangeCb).toBeCalledTimes(1);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);

        wrapper
            .find('.adyen-checkout__issuer-button-group button')
            .at(1)
            .simulate('click');

        callbackData = { data: { issuer: '5' }, valid: { issuer: true }, errors: { issuer: null }, isValid: true };

        expect(onChangeCb).toBeCalledTimes(2);
        expect(onChangeCb.mock.calls[1][0]).toStrictEqual(callbackData);
    });
});
