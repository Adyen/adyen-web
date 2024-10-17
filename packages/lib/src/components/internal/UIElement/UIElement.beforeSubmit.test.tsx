import { h } from 'preact';
import CardElement from '../../Card';

let onPaymentCompleted;
let onPaymentFailed;

beforeEach(() => {
    onPaymentCompleted = jest.fn(res => {
        console.log('### UIElement.test:::: onPaymentCompleted callback called res=', res);
    });
    onPaymentFailed = jest.fn(res => {
        console.log('### UIElement.test:::: onPaymentFailed callback called res=', res);
    });
});

describe('Testing beforeSubmit', () => {
    test('Because beforeSubmit resolves...', done => {
        const beforeSubmit = jest.fn((data, component, actions) => {
            console.log('### UIElement.test:::: beforeSubmit callback called');

            actions.resolve(data);
        });

        const elementRef = {
            state: {
                status: null
            },
            setStatus: status => {
                elementRef.state.status = status;
            }
        };

        // Session flow - session configuration should override merchant configuration
        const cardElement = new CardElement(global.core, {
            amount: { value: 0, currency: 'USD' },
            // @ts-ignore it's just a test
            session: { configuration: {} },
            beforeSubmit,
            onPaymentCompleted,
            elementRef
        });

        const paymentResponse = {
            resultCode: 'Authorised',
            sessionData: 'Ab02b4c0uKS50x...',
            sessionResult: 'X3XtfGC9...'
        };

        // @ts-ignore
        cardElement.submitUsingSessionsFlow = () => {
            console.log('### UIElement.beforeSubmit.test::submitUsingSessionsFlow:: MOCK');
            return Promise.resolve(paymentResponse);
        };

        cardElement.setState({ isValid: true });

        cardElement.submit();

        console.log('### Card.test:::: cardElement.elementRef.state', cardElement.elementRef.state);

        // initially submit should lead to UIElement.makePaymentsCall() which sets status to 'loading'
        expect(cardElement.elementRef.state.status).toEqual('loading');

        setTimeout(() => {
            expect(beforeSubmit).toHaveBeenCalled();

            console.log('### Card.test::2222:: cardElement.elementRef.state', cardElement.elementRef.state);

            // state.status doesn't get reset
            expect(cardElement.elementRef.state.status).toEqual('loading');

            expect(onPaymentCompleted).toHaveBeenCalledWith(paymentResponse, elementRef);

            done();
        }, 0);
    });

    test('Because beforeSubmit rejects the status gets set back to "ready"', done => {
        const beforeSubmit = jest.fn((data, component, actions) => {
            console.log('### Card.test:::: beforeSubmit callback called');

            actions.reject();
        });

        const elementRef = {
            state: {
                status: null
            },
            setStatus: status => {
                elementRef.state.status = status;
            }
        };

        // Session flow - session configuration should override merchant configuration
        const cardElement = new CardElement(global.core, {
            amount: { value: 0, currency: 'USD' },
            // @ts-ignore it's just a test
            session: { configuration: {} },
            beforeSubmit,
            onPaymentCompleted,
            onPaymentFailed,
            elementRef
        });

        cardElement.setState({ isValid: true });

        cardElement.submit();

        console.log('### Card.test:::: cardElement.elementRef.state', cardElement.elementRef.state);

        // initially submit should lead to UIElement.makePaymentsCall() which sets status to 'loading'
        expect(cardElement.elementRef.state.status).toEqual('loading');

        setTimeout(() => {
            expect(beforeSubmit).toHaveBeenCalled();

            console.log('### Card.test:::: cardElement.elementRef.state', cardElement.elementRef.state);

            expect(cardElement.elementRef.state.status).toEqual('ready');

            expect(onPaymentCompleted).not.toHaveBeenCalled();
            expect(onPaymentFailed).not.toHaveBeenCalled();

            done();
        }, 0);
    });
});
