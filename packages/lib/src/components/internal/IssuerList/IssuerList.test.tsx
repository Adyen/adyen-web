import { mount } from 'enzyme';
import { h } from 'preact';
import IssuerList from './IssuerList';
import PayButton from '../PayButton';
import CoreProvider from '../../../core/Context/CoreProvider';
import { ANALYTICS_FEATURED_ISSUER, ANALYTICS_LIST, ANALYTICS_SELECTED_STR } from '../../../core/Analytics/constants';

describe('IssuerList', () => {
    test('Accepts Items as props', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const wrapper = mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                />
            </CoreProvider>
        );
        expect(wrapper.find('IssuerList').props().items).toHaveLength(3);
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
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                />
            </CoreProvider>
        );
        expect(wrapper.find('IssuerList').props().highlightedIds).toHaveLength(2);
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
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={onChangeCb}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                />
            </CoreProvider>
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
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                />
            </CoreProvider>
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
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                />
            </CoreProvider>
        );

        const highlightedIssuerButton = wrapper.find('.adyen-checkout__issuer-button-group button').at(0);
        const highlightedIssuerDropdownItem = wrapper.find('ul li').at(2);

        expect(highlightedIssuerButton.text()).toBe(highlightedIssuerDropdownItem.text());
        expect(highlightedIssuerButton.prop('value')).toBe(highlightedIssuerDropdownItem.prop('data-value'));
    });
});

describe('IssuerList: calls that generate analytics should produce objects with the expected shapes ', () => {
    let onSubmitAnalytics;
    beforeEach(() => {
        console.log = jest.fn(() => {});

        onSubmitAnalytics = jest.fn(obj => {
            console.log('### IssuerList.test::callbacks.onSubmitAnalytics:: obj', obj);
        });
    });

    test('Clicking on a highlighted issuer button triggers call to onSubmitAnalytics with expected analytics object', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];

        expect(onSubmitAnalytics).toBeCalledTimes(0);

        const wrapper = mount(
            <IssuerList
                items={items}
                highlightedIds={highlightedIds}
                showPayButton={false}
                onChange={() => {}}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                onSubmitAnalytics={onSubmitAnalytics}
            />
        );

        wrapper.find('.adyen-checkout__issuer-button-group button').at(1).simulate('click');

        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: ANALYTICS_SELECTED_STR,
            target: ANALYTICS_FEATURED_ISSUER,
            issuer: 'Issuer 3'
        });
    });

    test('Clicking on a issuer in the dropdown triggers call to onSubmitAnalytics with expected analytics object', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];

        expect(onSubmitAnalytics).toBeCalledTimes(0);

        const wrapper = mount(
            <IssuerList
                items={items}
                showPayButton={false}
                onChange={() => {}}
                payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                onSubmitAnalytics={onSubmitAnalytics}
            />
        );

        const highlightedIssuerDropdownItem = wrapper.find('ul li').at(1);
        highlightedIssuerDropdownItem.simulate('click');

        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: ANALYTICS_SELECTED_STR,
            target: ANALYTICS_LIST,
            issuer: 'Issuer 2'
        });
    });
});
