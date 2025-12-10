import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import Iris from './Iris';

// Mock the isMobile utility
jest.mock('../../utils/isMobile', () => jest.fn());

import isMobile from '../../utils/isMobile';

const isMobileMock = isMobile as jest.Mock;

describe('Iris', () => {
    const defaultIssuers = [
        { id: 'PIRBGRAA', name: 'Piraeus Bank' },
        { id: 'ERBKGRAA', name: 'Eurobank' },
        { id: 'ETHNGRAA', name: 'National Bank of Greece' },
        { id: 'CRBAGRAA', name: 'Alpha Bank' },
        { id: 'PRXBGRAA', name: 'Viva' },
        { id: 'ATTIGRAA', name: 'CrediaBank' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        isMobileMock.mockReturnValue(false); // Default to desktop
    });

    describe('Default Mode Selection', () => {
        test('should pre-select "QR Code" mode on Desktop', async () => {
            isMobileMock.mockReturnValue(false);
            const core = setupCoreMock();

            const iris = new Iris(core, {
                issuers: defaultIssuers,
                i18n: core.modules.i18n,
                loadingContext: 'test',
                modules: { resources: core.modules.resources }
            });

            render(iris.render());

            const qrCodeButton = await screen.findByRole('button', { name: 'QR Code' });
            expect(qrCodeButton).toHaveAttribute('aria-expanded', 'true');
            expect(await screen.findByRole('button', { name: /Generate QR code/i })).toBeInTheDocument();
        });

        test('should pre-select "Bank List" mode on Mobile', async () => {
            isMobileMock.mockReturnValue(true);
            const core = setupCoreMock();

            const iris = new Iris(core, {
                issuers: defaultIssuers,
                i18n: core.modules.i18n,
                loadingContext: 'test',
                modules: { resources: core.modules.resources }
            });

            render(iris.render());

            const bankListButton = await screen.findByRole('button', { name: 'Bank List' });
            expect(bankListButton).toHaveAttribute('aria-expanded', 'true');
            expect(screen.queryByRole('button', { name: /Generate QR code/i })).not.toBeInTheDocument();
        });
    });

    describe('Making Payment', () => {
        describe('Issuer List Payment', () => {
            test('should trigger validation error if issuer is not selected', async () => {
                const user = userEvent.setup();
                const onSubmitMock = jest.fn();
                isMobileMock.mockReturnValue(true); // Start in Bank List mode
                const core = setupCoreMock();

                const iris = new Iris(core, {
                    issuers: defaultIssuers,
                    showPayButton: true,
                    onSubmit: onSubmitMock,
                    i18n: core.modules.i18n,
                    loadingContext: 'test',
                    modules: { resources: core.modules.resources }
                });

                render(iris.render());

                const payButton = await screen.findByRole('button', { name: /Continue/i });
                await user.click(payButton);

                // onSubmit should NOT be called when invalid
                expect(onSubmitMock).not.toHaveBeenCalled();
            });

            test('should call Payments API with correct payload including issuer', async () => {
                const user = userEvent.setup();
                const onSubmitMock = jest.fn();
                isMobileMock.mockReturnValue(true); // Start in Bank List mode
                const core = setupCoreMock();

                const iris = new Iris(core, {
                    issuers: defaultIssuers,
                    showPayButton: true,
                    onSubmit: onSubmitMock,
                    i18n: core.modules.i18n,
                    loadingContext: 'test',
                    modules: { resources: core.modules.resources }
                });

                render(iris.render());

                const issuerOption = await screen.findByRole('option', { name: /Piraeus Bank/i });
                await user.click(issuerOption);

                // Submit the form
                const payButton = await screen.findByRole('button', { name: /Continue/i });
                await user.click(payButton);

                await waitFor(() => {
                    expect(onSubmitMock).toHaveBeenCalled();
                });

                expect(onSubmitMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            paymentMethod: expect.objectContaining({
                                type: 'iris',
                                issuer: 'PIRBGRAA'
                            })
                        })
                    }),
                    expect.anything(),
                    expect.anything()
                );
            });
        });

        describe('QR Code Payment', () => {
            test('should NOT trigger issuer validation in QR Code mode', async () => {
                const core = setupCoreMock();

                const iris = new Iris(core, {
                    issuers: defaultIssuers,
                    i18n: core.modules.i18n,
                    loadingContext: 'test',
                    modules: { resources: core.modules.resources }
                });

                render(iris.render());

                // In QR Code mode (default on desktop), component should be valid without issuer selection
                await waitFor(() => {
                    expect(iris.isValid).toBe(true);
                });
            });

            test('should call Payments API with correct payload without issuer', async () => {
                const user = userEvent.setup();
                const onSubmitMock = jest.fn();
                const core = setupCoreMock();

                const iris = new Iris(core, {
                    issuers: defaultIssuers,
                    showPayButton: true,
                    onSubmit: onSubmitMock,
                    i18n: core.modules.i18n,
                    loadingContext: 'test',
                    modules: { resources: core.modules.resources }
                });

                render(iris.render());

                const generateQrButton = await screen.findByRole('button', { name: /Generate QR code/i });
                await user.click(generateQrButton);

                await waitFor(() => {
                    expect(onSubmitMock).toHaveBeenCalled();
                });

                // Verify issuer is NOT in the payload
                const submitCall = onSubmitMock.mock.calls[0][0];
                expect(submitCall.data.paymentMethod).not.toHaveProperty('issuer');
                expect(submitCall.data.paymentMethod.type).toBe('iris');
            });

            test('should NOT include issuer in payload when switching from Bank List to QR Code mode', async () => {
                const user = userEvent.setup();
                const onSubmitMock = jest.fn();
                isMobileMock.mockReturnValue(true); // Start in Bank List mode
                const core = setupCoreMock();

                const iris = new Iris(core, {
                    issuers: defaultIssuers,
                    showPayButton: true,
                    onSubmit: onSubmitMock,
                    i18n: core.modules.i18n,
                    loadingContext: 'test',
                    modules: { resources: core.modules.resources }
                });

                render(iris.render());

                const issuerOption = await screen.findByRole('option', { name: /Piraeus Bank/i });
                await user.click(issuerOption);

                // Switch to QR Code mode
                const qrCodeButton = await screen.findByRole('button', { name: 'QR Code' });
                await user.click(qrCodeButton);

                await waitFor(() => {
                    expect(screen.getByRole('button', { name: /Generate QR code/i })).toBeInTheDocument();
                });

                const generateQrButton = await screen.findByRole('button', { name: /Generate QR code/i });
                await user.click(generateQrButton);

                await waitFor(() => {
                    expect(onSubmitMock).toHaveBeenCalled();
                });

                // Verify issuer is NOT in the payload even though it was previously selected
                const submitCall = onSubmitMock.mock.calls[0][0];
                expect(submitCall.data.paymentMethod).not.toHaveProperty('issuer');
                expect(submitCall.data.paymentMethod.type).toBe('iris');
            });
        });
    });
});
