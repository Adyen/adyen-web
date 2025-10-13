import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import getDataset from '../../core/Services/get-dataset';
import PayTo from './PayTo';
import { MandateType } from './types';

jest.mock('../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(
    jest.fn(() => {
        return Promise.resolve([{ id: 'AUS', prefix: '+61' }]);
    })
);

const MOCK_MANDATE: MandateType = {
    amount: '4001', // [Mandatory] for PayTo - Mandate Amount field
    amountRule: 'exact', // [Mandatory] for PayTo - Needs to be Localised
    endsAt: '2024-12-31', // [Mandatory] for PayTo - Date format
    frequency: 'adhoc', // [Mandatory] for PayTo - Needs to be Localised
    remarks: 'testThroughFlow1', // [Mandatory] for PayTo - Needs to be Localised as "Description"
    count: '3', // [Optional] will be returned only if the merchant sends it
    startsAt: '2024-11-13' // [Optional] will be returned only if the merchant sends it
};

const onSubmitMock = jest.fn();
const user = userEvent.setup();

describe('PayTo', () => {
    afterEach(() => {
        onSubmitMock.mockClear();
    });

    test('should render payment and show PayID page', async () => {
        const payTo = new PayTo(global.core, {
            i18n: global.i18n,
            mandate: MOCK_MANDATE,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(payTo.render());
        expect(await screen.findByText(/Enter the PayID and account details that are connected to your Payto account./i)).toBeTruthy();
        expect(await screen.findByLabelText(/Prefix/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Mobile number/i)).toBeTruthy();
        expect(await screen.findByLabelText(/First name/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Last name/i)).toBeTruthy();
    });

    test('should render continue button', async () => {
        const payTo = new PayTo(global.core, {
            onSubmit: onSubmitMock,
            mandate: MOCK_MANDATE,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(payTo.render());
        const button = await screen.findByRole('button', { name: 'Continue' });

        // should not trigger the submit and render validation
        await user.click(button);
        expect(onSubmitMock).toHaveBeenCalledTimes(0);

        expect(await screen.findByText('Invalid mobile number')).toBeTruthy();
        expect(await screen.findByText('Enter your first name')).toBeTruthy();
        expect(await screen.findByText('Enter your last name')).toBeTruthy();
    });

    test('should change to different identifier when selected', async () => {
        const payTo = new PayTo(global.core, {
            onSubmit: onSubmitMock,
            mandate: MOCK_MANDATE,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources },
            showPayButton: false
        });

        render(payTo.render());

        await user.click(screen.queryByRole('button', { name: 'Mobile' }));
        await user.click(screen.queryByRole('option', { name: /Email/i }));

        expect(screen.queryByLabelText(/Prefix/i)).toBeFalsy();
        expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    });

    describe('PayTo shopperIdentifier', () => {
        test('should send phoneNumber in shopperIdentifier', async () => {
            const payTo = new PayTo(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });

            render(payTo.render());

            await user.type(screen.queryByLabelText(/Mobile number/i), '0411111111');
            await user.type(screen.queryByLabelText(/First name/i), 'John');
            await user.type(screen.queryByLabelText(/Last name/i), 'Doe');

            await user.click(screen.queryByRole('button', { name: 'Continue' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            shopperAccountIdentifier: '+61-0411111111',
                            type: 'payto'
                        }),
                        shopperName: {
                            firstName: 'John',
                            lastName: 'Doe'
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should send email in shopperIdentifier', async () => {
            const payTo = new PayTo(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });

            render(payTo.render());

            await user.click(screen.queryByRole('button', { name: 'Mobile' }));
            await user.click(screen.queryByRole('option', { name: /Email/i }));

            await user.type(screen.queryByLabelText(/Email/i), 'example@example.com');
            await user.type(screen.queryByLabelText(/First name/i), 'John');
            await user.type(screen.queryByLabelText(/Last name/i), 'Doe');

            await user.click(screen.queryByRole('button', { name: 'Continue' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            shopperAccountIdentifier: 'example@example.com',
                            type: 'payto'
                        }),
                        shopperName: {
                            firstName: 'John',
                            lastName: 'Doe'
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should send ABN in shopperIdentifier', async () => {
            const payTo = new PayTo(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });

            render(payTo.render());

            await user.click(screen.queryByRole('button', { name: 'Mobile' }));
            await user.click(screen.queryByRole('option', { name: /ABN/i }));

            await user.type(screen.queryByLabelText(/ABN/i), '123123123');
            await user.type(screen.queryByLabelText(/First name/i), 'John');
            await user.type(screen.queryByLabelText(/Last name/i), 'Doe');

            await user.click(screen.queryByRole('button', { name: 'Continue' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            shopperAccountIdentifier: '123123123',
                            type: 'payto'
                        }),
                        shopperName: {
                            firstName: 'John',
                            lastName: 'Doe'
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });

        test('should send BSB in shopperIdentifier', async () => {
            const payTo = new PayTo(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources }
            });

            render(payTo.render());

            await user.click(screen.queryByRole('button', { name: /BSB and account number/i }));

            await user.type(screen.queryByLabelText(/Bank account number/i), '12300123');
            await user.type(screen.queryByLabelText(/Bank State Branch/i), '123456');
            await user.type(screen.queryByLabelText(/First name/i), 'John');
            await user.type(screen.queryByLabelText(/Last name/i), 'Doe');

            await user.click(screen.queryByRole('button', { name: 'Continue' }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            shopperAccountIdentifier: '123456-12300123',
                            type: 'payto'
                        }),
                        shopperName: {
                            firstName: 'John',
                            lastName: 'Doe'
                        }
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('PayTo await screen', () => {
        const server = setupServer(
            http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
                return HttpResponse.json({
                    payload: 'mockPaymentData',
                    resultCode: 'pending',
                    type: 'pending'
                });
            })
        );

        beforeAll(() => server.listen());
        afterEach(() => server.resetHandlers());
        afterAll(() => server.close());

        test('should render await screen and transaction and mandate amount should be different', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: MOCK_MANDATE,
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            // amount from transaction
            expect(await screen.findByText('A$20.00')).toBeTruthy();

            // for context why we are not using roles here:
            // https://github.com/testing-library/dom-testing-library/issues/140

            // eslint-disable-next-line testing-library/no-node-access
            const mandateAmount = screen.getByText('Amount').nextSibling;
            expect(mandateAmount).toHaveTextContent('A$40.01');
        });

        test('should render await screen and amount should say up to if amountRule is max', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: {
                    ...MOCK_MANDATE,
                    amountRule: 'max'
                },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            // amount from transaction
            expect(await screen.findByText('A$20.00')).toBeTruthy();

            // eslint-disable-next-line testing-library/no-node-access
            const mandateAmount = screen.getByText('Amount').nextSibling;
            expect(mandateAmount).toHaveTextContent('Up to A$40.01 per transaction');
        });

        test('should render await screen and show correct frequency (Fortnightly)', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, frequency: 'biWeekly' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('3 payment(s) Fortnightly');
        });

        test('should render await screen and show correct frequency (Yearly)', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, frequency: 'yearly' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('3 payment(s) Yearly');
        });

        test('should render await screen and show correct frequency adhoc with count', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, frequency: 'adhoc' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('3 time(s)');
        });

        test('should render await screen and show correct frequency adhoc without count', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, count: null, frequency: 'adhoc' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('Ad Hoc');
        });

        // TODO waiting for feedback for what should be the result of this test case
        test.skip('should render await screen and show correct frequency daily without count', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, count: null, frequency: 'daily' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('Ad Hoc');
        });

        test('should render await screen and show the correct payee', async () => {
            const payTo = new PayTo(global.core, {
                ...global.commonCoreProps,
                amount: {
                    value: '2000',
                    currency: 'AUD'
                },
                mandate: { ...MOCK_MANDATE, count: null, frequency: 'daily' },
                paymentData: 'mockblob',
                payee: 'Mock Payee'
            });

            render(payTo.render());

            const mandateFrequency = await screen.findByText('Frequency');
            // eslint-disable-next-line testing-library/no-node-access
            expect(mandateFrequency.nextSibling).toHaveTextContent('Ad Hoc');
        });
    });

    describe('PayTo stored', () => {
        test('should render pay button when stored', async () => {
            const payTo = new PayTo(global.core, {
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources },
                storedPaymentMethodId: 'mock'
            });

            render(payTo.render());
            expect(await screen.findByRole('button', { name: /Pay/i })).toBeTruthy();
            expect(screen.queryByLabelText(/Prefix/i)).toBeFalsy();
            expect(screen.queryByLabelText(/Prefix/i)).toBeFalsy();
            expect(screen.queryByLabelText(/Mobile number/i)).toBeFalsy();
            expect(screen.queryByLabelText(/First name/i)).toBeFalsy();
            expect(screen.queryByLabelText(/Last name/i)).toBeFalsy();
        });

        test('should send storedPaymentMethodId button when stored', async () => {
            const payTo = new PayTo(global.core, {
                onSubmit: onSubmitMock,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources },
                storedPaymentMethodId: 'mock'
            });

            render(payTo.render());

            await user.click(screen.queryByRole('button', { name: /Pay/i }));

            expect(onSubmitMock).toHaveBeenCalledTimes(1);
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentMethod: expect.objectContaining({
                            storedPaymentMethodId: 'mock',
                            type: 'payto'
                        })
                    })
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });
});
