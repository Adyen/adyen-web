import Giftcard from './Giftcard';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { reject } from '../../utils/commonUtils';

const flushPromises = () => new Promise(process.nextTick);

describe('Giftcard', () => {
    const resources = global.resources;
    const i18n = global.i18n;
    const user = userEvent.setup();

    const baseProps = {
        modules: {
            resources,
            analytics: global.analytics
        },
        amount: { value: 1000, currency: 'EUR' },
        name: 'My Test Gift Card',
        type: 'giftcard',
        brand: 'genericgiftcard',
        i18n,
        loadingContext: 'mock'
    };

    // these test have been changed to trigger on submit instead of balance check
    describe('onBalanceCheck func in submit', () => {
        test('If onBalanceCheck is not provided, step is skipped ayarnnd calls onSubmit', async () => {
            const onSubmitMock = jest.fn();
            const giftcard = new Giftcard(global.core, { ...baseProps, onSubmit: onSubmitMock });
            giftcard.setState({ isValid: true });

            giftcard.submit();
            await flushPromises();

            expect(onSubmitMock).toHaveBeenCalled();
        });

        test('onBalanceCheck will be skipped if the component is not valid', () => {
            const onBalanceCheck = jest.fn();
            const giftcard = new Giftcard(global.core, { ...baseProps, onBalanceCheck });
            giftcard.setState({ isValid: false });
            giftcard.submit();

            expect(onBalanceCheck).not.toHaveBeenCalled();
        });
    });

    describe('icon getters', () => {
        test('should default to loading from resources', () => {
            const giftcard = new Giftcard(global.core, { ...baseProps });

            expect(giftcard.icon).toBe('MOCK');
        });

        test('should use the prop .icon as 2. priority', () => {
            const giftcard = new Giftcard(global.core, { ...baseProps, icon: 'PROP_ICON_MOCK' });

            expect(giftcard.icon).toBe('PROP_ICON_MOCK');
        });

        test('should use brandsConfiguration as 1. priority', () => {
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                icon: 'PROP_ICON_MOCK',
                brandsConfiguration: {
                    genericgiftcard: { icon: 'genericgiftcard_MOCK' },
                    givex: { icon: 'givex_MOCK' }
                }
            });

            expect(giftcard.icon).toBe('genericgiftcard_MOCK');
            expect(giftcard.icon).not.toBe('PROP_ICON_MOCK');
        });
    });

    describe('displayName getters', () => {
        test('should default to props.name', () => {
            const giftcard = new Giftcard(global.core, { ...baseProps });

            expect(giftcard.displayName).toBe('My Test Gift Card');
        });

        test('should use brandsConfiguration as 1. priority', () => {
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                brandsConfiguration: {
                    genericgiftcard: { name: 'genericgiftcard brand name' },
                    givex: { name: 'givex brand name' }
                }
            });

            expect(giftcard.displayName).toBe('genericgiftcard brand name');
            expect(giftcard.displayName).not.toBe('givex brand name');
        });
    });

    describe('onBalanceCheck handling', () => {
        test('onBalanceCheck should be called on pay button click', async () => {
            const onBalanceCheck = jest.fn();

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck
            });
            render(giftcard.render());
            // skip feeling in fields
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onBalanceCheck).toHaveBeenCalled();
        });

        test('after balance check we should call onOrderRequest if not enough balance for checkout', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 500, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn();

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onOrderRequest
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            // since the balance is not enough for a full we should create an order
            expect(onOrderRequest).toHaveBeenCalled();
        });

        test('if there is enough balance for checkout we should require confirmation', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 2000, currency: 'EUR' }
                })
            );
            const onRequiringConfirmation = jest.fn();

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onRequiringConfirmation
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            // since there is enough balance we should inform merchant
            // to confirm using the giftcard funds
            expect(onRequiringConfirmation).toHaveBeenCalled();
        });

        test('if theres 0 balance we should trigger and error', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 0, currency: 'EUR' }
                })
            );

            // mounting and clicking pay button
            const onError = jest.fn();
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onError
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onBalanceCheck).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('onOrderRequest handling', () => {
        test('after creating an order we should call submit / payments endpoint', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 500, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn(resolve =>
                resolve({
                    orderData: 'mock',
                    pspReference: 'mock'
                })
            );
            const onSubmit = jest.fn();

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onOrderRequest,
                onSubmit
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onSubmit).toHaveBeenCalled();
        });

        test('should not create new order if one already exists', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 500, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn(resolve =>
                resolve({
                    orderData: 'mock',
                    pspReference: 'mock'
                })
            );
            const onSubmit = jest.fn();

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                order: {
                    orderData: 'mock',
                    pspReference: 'xxxx'
                },
                onBalanceCheck,
                onOrderRequest,
                onSubmit
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onOrderRequest).not.toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    describe('onRequiringConfirmation handling', () => {
        test('should require confirmation and resolve payment', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 2000, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn(resolve => resolve({}));
            const onSubmit = jest.fn();
            const onRequiringConfirmation = jest.fn(resolve => resolve());

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onOrderRequest,
                onRequiringConfirmation,
                onSubmit
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onOrderRequest).not.toHaveBeenCalled();
            expect(onRequiringConfirmation).toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalled();
        });

        test('should require confirmation and cancel payment', async () => {
            const onBalanceCheck = jest.fn(resolve =>
                resolve({
                    balance: { value: 2000, currency: 'EUR' }
                })
            );
            const onOrderRequest = jest.fn(resolve => resolve({}));
            const onSubmit = jest.fn();
            const onRequiringConfirmation = jest.fn(({ reject }) => reject());

            // mounting and clicking pay button
            const giftcard = new Giftcard(global.core, {
                ...baseProps,
                onBalanceCheck,
                onOrderRequest,
                onRequiringConfirmation,
                onSubmit
            });
            render(giftcard.render());
            giftcard.setState({ isValid: true });
            const payButton = await screen.findByRole('button');
            await user.click(payButton);

            expect(onOrderRequest).not.toHaveBeenCalled();
            expect(onRequiringConfirmation).toHaveBeenCalled();
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });
});
