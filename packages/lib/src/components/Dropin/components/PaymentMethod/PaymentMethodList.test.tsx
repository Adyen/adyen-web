import { shallow } from 'enzyme';
import { h } from 'preact';
import PaymentMethodList from './PaymentMethodList';
import PaymentMethodItem from './PaymentMethodItem';
import InstantPaymentMethods from './InstantPaymentMethods';
import { render, screen, waitFor } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import Language from '../../../../language';

const i18n = { get: key => key };
const paymentMethods = [
    {
        props: {
            id: '1',
            type: 'mytype',
            oneClick: false
        },
        render: jest.fn()
    },
    {
        props: {
            id: '2',
            type: 'mytype2',
            oneClick: false
        },
        render: jest.fn()
    }
];

const instantPaymentMethods = [
    {
        props: {
            id: '3',
            type: 'googlepay'
        }
    }
];

test('onSelect should be triggered only once', () => {
    render(
        <PaymentMethodList
            paymentMethods={[]}
            instantPaymentMethods={[]}
            activePaymentMethod={null}
            cachedPaymentMethods={{}}
            onSelect={() => {}}
            onDisableStoredPaymentMethod={() => {}}
            orderStatus={null}
            isDisabling={false}
            isLoading={false}
        />
    );
});

describe('PaymentMethodList', () => {
    const getWrapper = props => shallow(<PaymentMethodList i18n={i18n} {...props} />);

    test('Renders a PaymentMethodList', () => {
        const wrapper = getWrapper({ paymentMethods });

        expect(wrapper.hasClass('adyen-checkout__payment-methods-list')).toBe(true);
        expect(wrapper.find(PaymentMethodItem).length).toBe(2);
    });

    test('Does not respond to openFirstPaymentMethod if there is no paymentmethod', () => {
        const onSelect = jest.fn();

        getWrapper({ paymentMethods: [], onSelect, openFirstPaymentMethod: true });
        expect(onSelect.mock.calls.length).toBe(0);
    });

    test('Responds to openFirstStoredPaymentMethod', () => {
        const onSelect = jest.fn();
        paymentMethods[0].props.oneClick = true;

        getWrapper({ paymentMethods, onSelect, openFirstStoredPaymentMethod: true });
        expect(onSelect.mock.calls[0][0]).toBe(paymentMethods[0]);
    });

    test('Does not respond to openFirstStoredPaymentMethod if no oneClick paymentMethod is found', () => {
        const onSelect = jest.fn();
        paymentMethods[0].props.oneClick = false;

        getWrapper({ paymentMethods, onSelect, openFirstStoredPaymentMethod: true });
        expect(onSelect.mock.calls.length).toBe(0);
    });

    test('Renders InstantPaymentMethods when prop is provided', () => {
        const wrapper = getWrapper({ paymentMethods, instantPaymentMethods });
        expect(wrapper.find(InstantPaymentMethods)).toHaveLength(1);
    });
});
