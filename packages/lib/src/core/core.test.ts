import Core from './core';

describe('Core', () => {
    test('Should default to the FALLBACK_LOCALE', () => {
        const Checkout = new Core({});
        expect(Checkout.modules.i18n.locale).toBe('en-US');
    });

    test('Should contain modules', () => {
        const Checkout = new Core({ locale: 'es-ES' });
        expect(Object.keys(Checkout.modules).length).toBeGreaterThan(1);
    });

    test('Should set a custom locale', () => {
        const Checkout = new Core({ locale: 'es-ES' });
        expect(Checkout.modules.i18n.locale).toBe('es-ES');
    });

    describe('create', () => {
        test('Should create a component if it exists', () => {
            const Checkout = new Core({});
            expect(Checkout.create('dropin')).toBeTruthy();
            expect(() => Checkout.create('notapaymentmethod')).toThrow();
        });
    });

    describe('createFromAction', () => {
        test('Should create a component from an action object', () => {
            const checkout = new Core({});

            const paymentAction = checkout.createFromAction({
                method: 'GET',
                paymentMethodType: 'ideal',
                type: 'redirect',
                url: 'https://example.com'
            });

            expect(paymentAction.constructor['type']).toBe('redirect');
        });

        test('should handle new fingerprint action', () => {
            const checkout = new Core({ challengeWindowSize: '04' });

            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token:
                    'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const pa = checkout.createFromAction(fingerprintAction);

            expect(pa.constructor['type']).toBe('threeDS2Fingerprint');

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).toEqual(true);
            expect(pa.props.statusType).toEqual('loading');

            expect(pa.props.challengeWindowSize).toEqual('04');
        });

        test('should handle new challenge action', () => {
            const checkout = new Core({ challengeWindowSize: '03' });

            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token:
                    'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const pa = checkout.createFromAction(challengeAction);

            expect(pa.constructor['type']).toBe('threeDS2Challenge');

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).not.toBeDefined();
            expect(pa.props.statusType).toEqual('custom');

            expect(pa.props.challengeWindowSize).toEqual('03');
        });
    });

    describe('update', () => {
        test('Should update all components under main instance', () => {
            const checkout = new Core({});
            const component = checkout.create('dropin').mount('body');
            const spy = jest.spyOn(component, 'update');
            checkout.update();

            expect(spy).toHaveBeenCalled();
        });
    });
});
