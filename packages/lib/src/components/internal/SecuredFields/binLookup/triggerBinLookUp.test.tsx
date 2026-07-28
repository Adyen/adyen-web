import { h } from 'preact';
import { triggerBinLookUp } from './triggerBinLookUp';
import { httpPost } from '../../../../core/Services/http';
import { DEFAULT_CARD_GROUP_TYPES } from '../lib/constants';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { SF_ErrorCodes } from '../../../../core/Errors/constants';
import { TxVariants } from '../../../tx-variants';
import CardElement from '../../../Card';

jest.mock('../../../../core/Services/http');

const mockOnBinLookup = jest.fn();
const mockProcessBinLookupResponse = jest.fn();
const mockOnError = jest.fn();
const mockHandleUnsupportedCard = jest.fn();

class MockCardElement extends CardElement {
    public processBinLookupResponse = mockProcessBinLookupResponse;
    public onBinLookup = mockOnBinLookup;
    public handleUnsupportedCard = mockHandleUnsupportedCard;
    protected override componentToRender() {
        return <div></div>;
    }
}

const clientKey = 'test';
const loadingContext = 'test';
const visa = 'visa';
const httpPostMock = httpPost as jest.Mock;
const core = setupCoreMock();

beforeEach(() => {
    httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({})));
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('triggerBinLookUp', () => {
    describe('Turning off the doBinLookup flag ', () => {
        test('should call the onBinValue callback if doBinLookup is false and onBinValue exists', () => {
            const mockCardElement = new MockCardElement(core, { onBinValue: mockOnBinLookup, doBinLookup: false });
            triggerBinLookUp(mockCardElement)({ type: '', binValue: '' });

            expect(mockOnBinLookup).toHaveBeenCalledWith({ type: '', binValue: '' });
        });
    });

    describe('Performing binLookUp', () => {
        test('should call the onBinValue callback if it exists', () => {
            const mockCardElement = new MockCardElement(core, { onBinValue: mockOnBinLookup });
            const bin = { type: '', binValue: '' };
            triggerBinLookUp(mockCardElement)(bin);

            expect(mockOnBinLookup).toHaveBeenCalledWith(bin);
        });

        test('should call the correct binLookup endpoint with the given brands from UIElement', () => {
            const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brand: visa, brands: [visa], onError: mockOnError });
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockCardElement);
            lookUpBin(bin);

            expect(httpPostMock).toHaveBeenCalledWith(
                { loadingContext, path: `v3/bin/binLookup?token=${clientKey}` },
                {
                    type: visa,
                    supportedBrands: [visa],
                    encryptedBin: bin.encryptedBin,
                    requestId: bin.uuid
                }
            );
        });

        test('should call the correct binLookup endpoint with the predefined brands', () => {
            const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brand: visa, onError: mockOnError });
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockCardElement);
            lookUpBin(bin);

            expect(httpPostMock).toHaveBeenCalledWith(
                { loadingContext, path: `v3/bin/binLookup?token=${clientKey}` },
                {
                    type: visa,
                    supportedBrands: DEFAULT_CARD_GROUP_TYPES,
                    encryptedBin: bin.encryptedBin,
                    requestId: bin.uuid
                }
            );
        });

        test('should default the request type to "card" when no brand prop is set on the UIElement', () => {
            const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, onError: mockOnError });
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockCardElement);
            lookUpBin(bin);

            expect(httpPostMock).toHaveBeenCalledWith(
                { loadingContext, path: `v3/bin/binLookup?token=${clientKey}` },
                expect.objectContaining({ type: TxVariants.card })
            );
        });

        test('should not perform a binLookup when there is an encryptedBin but no clientKey, but should still call onBinValue', () => {
            const mockCardElement = new MockCardElement(core, { loadingContext, onBinValue: mockOnBinLookup });
            // Ensure there is no clientKey on the props
            delete mockCardElement.props.clientKey;
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockCardElement);
            lookUpBin(bin);

            expect(httpPostMock).not.toHaveBeenCalled();
            expect(mockOnBinLookup).toHaveBeenCalledWith(bin);
        });

        describe('Handling the binLookUp response', () => {
            test('should call the onError callback if the response does not contain the matching requestId', async () => {
                const mockCardElement = new MockCardElement(core, {
                    clientKey,
                    loadingContext,
                    brands: [visa],
                    onError: mockOnError
                });
                const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
                const lookUpBin = triggerBinLookUp(mockCardElement);
                lookUpBin(bin);
                await new Promise(process.nextTick);
                expect(mockOnError).toHaveBeenCalledWith({});
            });

            test('should call the onError callback with a default error object when the response is empty (null)', async () => {
                httpPostMock.mockImplementation(jest.fn(() => Promise.resolve(null)));

                const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa], onError: mockOnError });
                const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
                const lookUpBin = triggerBinLookUp(mockCardElement);
                lookUpBin(bin);
                await new Promise(process.nextTick);

                expect(mockOnError).toHaveBeenCalledWith({ errorType: 'binLookup', message: 'unknownError' });
            });

            test('should not call the onError callback when the response contains a non-matching requestId', async () => {
                httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId: 'some-other-id' })));

                const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa], onError: mockOnError });
                const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
                const lookUpBin = triggerBinLookUp(mockCardElement);
                lookUpBin(bin);
                await new Promise(process.nextTick);

                expect(mockOnError).not.toHaveBeenCalled();
                expect(mockOnBinLookup).not.toHaveBeenCalled();
                expect(mockProcessBinLookupResponse).not.toHaveBeenCalled();
            });

            describe('BinLookup response.requestId matches the provided requestId', () => {
                describe('BinLookup does not return any brands', () => {
                    test('should call the UIElement onBinLookup and processBinLookupResponse with correct data', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId })));

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({
                                brands: [visa, 'mc']
                            })
                        );
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith({}, true);
                    });
                });

                describe('BinLookup returns supported brands', () => {
                    test('should call the UIElement onBinLookup and processBinLookupResponse with correct brands data', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true }] })));

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({
                                brands: [visa, 'mc'],
                                supportedBrands: [visa],
                                detectedBrands: [visa]
                            })
                        );
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({ supportedBrands: [{ brand: visa, supported: true }] })
                        );
                    });

                    test('should call the UIElement processBinLookupResponse with showSocialSecurityNumber if it presents in the response', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, showSocialSecurityNumber: true, brands: [{ brand: visa, supported: true }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({ supportedBrands: [{ brand: visa, supported: true }], showSocialSecurityNumber: true })
                        );
                    });

                    test('should call the UIElement onBinLookup with the healthcare value when present in the response', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, healthcare: true }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledWith(expect.objectContaining({ healthcare: [{ visa: true }] }));
                    });

                    test('should omit the healthcare field from the UIElement onBinLookup when not present in the response', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true }] })));

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledTimes(1);
                        const callArg = mockOnBinLookup.mock.calls[0][0];
                        expect(callArg).not.toHaveProperty('healthcare');
                    });

                    test('should propagate the issuingCountryCode to both processBinLookupResponse and onBinLookup', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, issuingCountryCode: 'NL', brands: [{ brand: visa, supported: true }] }))
                        );

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(expect.objectContaining({ issuingCountryCode: 'NL' }));
                        expect(mockOnBinLookup).toHaveBeenCalledWith(expect.objectContaining({ issuingCountryCode: 'NL' }));
                    });

                    test('should default issuingCountryCode to an empty string for processBinLookupResponse when absent from the response', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true }] })));

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(expect.objectContaining({ issuingCountryCode: '' }));
                    });

                    test('should propagate the paymentMethodVariants to onBinLookup', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, paymentMethodVariant: 'vpay' }] }))
                        );

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledWith(expect.objectContaining({ paymentMethodVariants: ['vpay'] }));
                    });

                    test('should only include supported brands in supportedBrands while all brands are reported in detectedBrands', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true },
                                        { brand: 'mc', supported: false }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({
                                detectedBrands: [visa, 'mc'],
                                supportedBrands: [visa]
                            })
                        );
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({ supportedBrands: [{ brand: visa, supported: true }] })
                        );
                    });
                });

                describe('BinLookup returns detected but unsupported brands', () => {
                    test('should call handleUnsupportedCard with the unsupported card error and onBinLookup with supportedBrands set to null', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: false }] })));

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: ['mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).toHaveBeenCalledWith({
                            type: 'card',
                            fieldType: 'encryptedCardNumber',
                            error: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED,
                            detectedBrands: [visa]
                        });
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({
                                detectedBrands: [visa],
                                supportedBrands: null,
                                brands: ['mc']
                            })
                        );
                        // processBinLookupResponse should NOT be called on the unsupported path
                        expect(mockProcessBinLookupResponse).not.toHaveBeenCalled();
                    });

                    test('should call the UIElement onBinLookup with healthcare when the unsupported brand has healthcare', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: false, healthcare: true }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: ['mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockCardElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).toHaveBeenCalled();
                        expect(mockOnBinLookup).toHaveBeenCalledWith(expect.objectContaining({ healthcare: [{ visa: true }] }));
                    });
                });

                describe('Strict funding source validation', () => {
                    test('should reject the card as unsupported when the binLookup funding source is not in allowedFundingSources', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, fundingSource: 'credit' }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).toHaveBeenCalledWith({
                            type: 'card',
                            fieldType: 'encryptedCardNumber',
                            error: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_FUNDING_SOURCE,
                            detectedBrands: [visa]
                        });
                        expect(mockOnBinLookup).toHaveBeenCalledWith(expect.objectContaining({ detectedBrands: [visa], supportedBrands: null }));
                        expect(mockProcessBinLookupResponse).not.toHaveBeenCalled();
                    });

                    test('should accept the card when the binLookup funding source is included in allowedFundingSources', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, fundingSource: 'debit' }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({ supportedBrands: [{ brand: visa, supported: true, fundingSource: 'debit' }] })
                        );
                    });

                    test('should not validate when the binLookup returns no funding source', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true }] })));

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockProcessBinLookupResponse).toHaveBeenCalled();
                    });

                    test('should not validate when allowedFundingSources is not present, even on a disallowed funding source', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, fundingSource: 'credit' }] }))
                        );

                        const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockProcessBinLookupResponse).toHaveBeenCalled();
                    });

                    test('should not validate when allowedFundingSources is an empty string, even on a disallowed funding source', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true, fundingSource: 'credit' }] }))
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc'],
                            configuration: { allowedFundingSources: '' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockProcessBinLookupResponse).toHaveBeenCalled();
                    });

                    test('should narrow the Card UI to the surviving brand while still reporting all detected brands to the merchant', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true, fundingSource: 'debit' },
                                        { brand: 'cartebancaire', supported: true, fundingSource: 'credit' }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        // The Card UI is narrowed to the surviving brand
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({
                                supportedBrands: [{ brand: visa, supported: true, fundingSource: 'debit' }]
                            })
                        );
                        // The merchant callback still receives the complete binLookup result
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({
                                detectedBrands: [visa, 'cartebancaire'],
                                supportedBrands: [visa, 'cartebancaire'],
                                supportedBrandsRaw: [
                                    { brand: visa, supported: true, fundingSource: 'debit' },
                                    { brand: 'cartebancaire', supported: true, fundingSource: 'credit' }
                                ]
                            })
                        );
                    });

                    test('should never filter out a brand without a funding source and narrow the UI while reporting all brands to the merchant', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true },
                                        { brand: 'cartebancaire', supported: true, fundingSource: 'credit' }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        // The Card UI keeps only the funding-source-less surviving brand
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({
                                supportedBrands: [{ brand: visa, supported: true }]
                            })
                        );
                        // The merchant callback still receives the complete binLookup result
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({ detectedBrands: [visa, 'cartebancaire'], supportedBrands: [visa, 'cartebancaire'] })
                        );
                    });

                    test('should keep both brands of a dual-branded card when every funding source is allowed', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true, fundingSource: 'debit' },
                                        { brand: 'cartebancaire', supported: true, fundingSource: 'prepaid' }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({
                                supportedBrands: [
                                    { brand: visa, supported: true, fundingSource: 'debit' },
                                    { brand: 'cartebancaire', supported: true, fundingSource: 'prepaid' }
                                ]
                            })
                        );
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({ detectedBrands: [visa, 'cartebancaire'], supportedBrands: [visa, 'cartebancaire'] })
                        );
                    });

                    test('should keep both brands of a dual-branded card when neither brand reports a funding source', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true },
                                        { brand: 'cartebancaire', supported: true }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({ detectedBrands: [visa, 'cartebancaire'], supportedBrands: [visa, 'cartebancaire'] })
                        );
                    });

                    test('should keep only the allowed and the funding-source-less brands from a triple-branded card', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true, fundingSource: 'debit' },
                                        { brand: 'mc', supported: true, fundingSource: 'credit' },
                                        { brand: 'cartebancaire', supported: true }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'mc', 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                        // The Card UI keeps only the allowed and funding-source-less brands
                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({
                                supportedBrands: [
                                    { brand: visa, supported: true, fundingSource: 'debit' },
                                    { brand: 'cartebancaire', supported: true }
                                ]
                            })
                        );
                        // The merchant callback still receives every detected/supported brand, including the filtered-out mc
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({ detectedBrands: [visa, 'mc', 'cartebancaire'], supportedBrands: [visa, 'mc', 'cartebancaire'] })
                        );
                    });

                    test('should reject a dual-branded card when every brand has a disallowed funding source', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(
                            jest.fn(() =>
                                Promise.resolve({
                                    requestId,
                                    brands: [
                                        { brand: visa, supported: true, fundingSource: 'credit' },
                                        { brand: 'cartebancaire', supported: true, fundingSource: 'credit' }
                                    ]
                                })
                            )
                        );

                        const mockCardElement = new MockCardElement(core, {
                            clientKey,
                            loadingContext,
                            brands: [visa, 'cartebancaire'],
                            configuration: { allowedFundingSources: 'debit, prepaid' }
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        triggerBinLookUp(mockCardElement)(bin);
                        await new Promise(process.nextTick);

                        expect(mockHandleUnsupportedCard).toHaveBeenCalledWith({
                            type: 'card',
                            fieldType: 'encryptedCardNumber',
                            error: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_FUNDING_SOURCE,
                            detectedBrands: [visa, 'cartebancaire']
                        });
                        expect(mockOnBinLookup).toHaveBeenCalledWith(
                            expect.objectContaining({ detectedBrands: [visa, 'cartebancaire'], supportedBrands: null })
                        );
                        expect(mockProcessBinLookupResponse).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe('Resetting the UI when the number of digits drops below the binLookup threshold', () => {
            test('should reset the UI when a subsequent callback has no encryptedBin after a lookup was performed', async () => {
                const requestId = '123456789';
                httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId, brands: [{ brand: visa, supported: true }] })));

                const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa, 'mc'] });
                const lookUpBin = triggerBinLookUp(mockCardElement);

                // First call performs a lookup and stores the currentRequestId
                lookUpBin({ binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId });
                await new Promise(process.nextTick);

                jest.clearAllMocks();

                // Second call has no encryptedBin => the shopper has deleted digits => reset the UI
                lookUpBin({ binValue: '', type: '' });

                expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(null, true);
                expect(mockHandleUnsupportedCard).toHaveBeenCalledWith({
                    type: 'card',
                    fieldType: 'encryptedCardNumber',
                    error: ''
                });
                expect(mockOnBinLookup).toHaveBeenCalledWith({ isReset: true });
                // No new lookup request should be fired
                expect(httpPostMock).not.toHaveBeenCalled();
            });

            test('should not reset the UI when no lookup has previously been performed', () => {
                const mockCardElement = new MockCardElement(core, { clientKey, loadingContext, brands: [visa], onBinValue: mockOnBinLookup });
                const lookUpBin = triggerBinLookUp(mockCardElement);

                // No encryptedBin and no prior lookup => neither a lookup nor a reset should happen
                lookUpBin({ binValue: '', type: '' });

                expect(httpPostMock).not.toHaveBeenCalled();
                expect(mockProcessBinLookupResponse).not.toHaveBeenCalled();
                expect(mockHandleUnsupportedCard).not.toHaveBeenCalled();
                // onBinValue is still invoked at the end of the callback
                expect(mockOnBinLookup).toHaveBeenCalledWith({ binValue: '', type: '' });
            });
        });
    });
});
