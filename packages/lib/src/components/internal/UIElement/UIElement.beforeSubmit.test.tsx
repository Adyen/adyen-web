import { h } from 'preact';
import UIElement from './UIElement';

class MyElement extends UIElement {
    public static type = 'myComp';

    // @ts-ignore it's a test
    public elementRef = {
        state: {
            status: null
        },
        setStatus: status => {
            this.elementRef.state.status = status;
        }
    };

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return '';
    }
}

let onPaymentCompleted;
let onPaymentFailed;

beforeEach(() => {
    onPaymentCompleted = jest.fn();
    onPaymentFailed = jest.fn();
});

describe('Testing beforeSubmit', () => {
    test('Because beforeSubmit resolves onPaymentCompleted is called', done => {
        const beforeSubmit = jest.fn((data, component, actions) => {
            actions.resolve(data);
        });

        const myElement = new MyElement(global.core, {
            amount: { value: 0, currency: 'USD' },
            // @ts-ignore it's just a test
            session: { configuration: {} },
            beforeSubmit,
            onPaymentCompleted
        });

        const paymentResponse = {
            resultCode: 'Authorised',
            sessionData: 'Ab02b4c0uKS50x...',
            sessionResult: 'X3XtfGC9...'
        };

        // @ts-ignore it's a test
        myElement.submitUsingSessionsFlow = () => {
            return Promise.resolve(paymentResponse);
        };

        myElement.setState({ isValid: true });

        myElement.submit();

        // initially submit should lead to UIElement.makePaymentsCall() which sets status to 'loading'
        expect(myElement.elementRef.state.status).toEqual('loading');

        setTimeout(() => {
            expect(beforeSubmit).toHaveBeenCalled();

            // state.status doesn't get reset
            expect(myElement.elementRef.state.status).toEqual('loading');

            expect(onPaymentCompleted).toHaveBeenCalledWith(paymentResponse, myElement.elementRef);

            done();
        }, 0);
    });

    test('Because beforeSubmit rejects the status gets set back to "ready" but onPaymentFailed does not get called', done => {
        const beforeSubmit = jest.fn((data, component, actions) => {
            actions.reject();
        });

        const myElement = new MyElement(global.core, {
            amount: { value: 0, currency: 'USD' },
            // @ts-ignore it's just a test
            session: { configuration: {} },
            beforeSubmit,
            onPaymentCompleted,
            onPaymentFailed
        });

        myElement.setState({ isValid: true });

        myElement.submit();

        // initially submit should lead to UIElement.makePaymentsCall() which sets status to 'loading'
        expect(myElement.elementRef.state.status).toEqual('loading');

        setTimeout(() => {
            expect(beforeSubmit).toHaveBeenCalled();

            expect(myElement.elementRef.state.status).toEqual('ready');

            expect(onPaymentCompleted).not.toHaveBeenCalled();
            expect(onPaymentFailed).not.toHaveBeenCalled();

            done();
        }, 0);
    });
});
