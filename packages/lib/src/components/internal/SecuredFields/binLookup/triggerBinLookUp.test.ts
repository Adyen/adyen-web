import triggerBinLookUp from './triggerBinLookUp';
import { httpPost } from '../../../../core/Services/http';
import UIElement from '../../UIElement';
import { DEFAULT_CARD_GROUP_TYPES } from '../lib/constants';

jest.mock('../../../../core/Services/http');

const mockOnBinLookup = jest.fn();
const mockProcessBinLookupResponse = jest.fn();
const mockOnError = jest.fn();
const mockHandleUnsupportedCard = jest.fn();

class MockUIElement extends UIElement {
    public processBinLookupResponse = mockProcessBinLookupResponse;
    public onBinLookup = mockOnBinLookup;
    public handleUnsupportedCard = mockHandleUnsupportedCard;
}

const clientKey = 'test';
const loadingContext = 'test';
const visa = 'visa';
const httpPostMock = httpPost as jest.Mock;

beforeEach(() => {
    httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({})));
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('triggerBinLookUp', () => {
    describe('Turning off the doBinLookup flag ', () => {
        test('should call the onBinValue callback if doBinLookup is false and onBinValue exists', () => {
            // @ts-ignore test
            const mockUIElement = new MockUIElement(global.core, { onBinValue: mockOnBinLookup, doBinLookup: false });
            triggerBinLookUp(mockUIElement)({ type: '', binValue: '' });

            expect(mockOnBinLookup).toHaveBeenCalledWith({ type: '', binValue: '' });
        });
    });

    describe('Performing binLookUp', () => {
        test('should call the onBinValue callback if it exists', () => {
            // @ts-ignore test
            const mockUIElement = new MockUIElement(global.core, { onBinValue: mockOnBinLookup });
            const bin = { type: '', binValue: '' };
            triggerBinLookUp(mockUIElement)(bin);

            expect(mockOnBinLookup).toHaveBeenCalledWith(bin);
        });

        test('should call the correct binLookup endpoint with the given brands from UIElement', () => {
            // @ts-ignore test
            const mockUIElement = new MockUIElement(global.core, { clientKey, loadingContext, brand: visa, brands: [visa], onError: mockOnError });
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockUIElement);
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
            // @ts-ignore test
            const mockUIElement = new MockUIElement(global.core, { clientKey, loadingContext, brand: visa, onError: mockOnError });
            const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
            const lookUpBin = triggerBinLookUp(mockUIElement);
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

        describe('Handling the binLookUp response', () => {
            test('should call the onError callback if the response does not contain the matching requestId', async () => {
                // @ts-ignore test
                const mockUIElement = new MockUIElement(global.core, {
                    clientKey,
                    loadingContext,
                    // @ts-ignore test
                    brands: [visa],
                    onError: mockOnError
                });
                const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: '123456789' };
                const lookUpBin = triggerBinLookUp(mockUIElement);
                lookUpBin(bin);
                await new Promise(process.nextTick);
                expect(mockOnError).toHaveBeenCalledWith({});
            });

            describe('BinLookup response.requestId matches the provided requestId', () => {
                describe('BinLookup does not return any brands', () => {
                    test('should call the UIElement onBinLookup and processBinLookupResponse with correct data', async () => {
                        const requestId = '123456789';
                        httpPostMock.mockImplementation(jest.fn(() => Promise.resolve({ requestId })));

                        // @ts-ignore test
                        const mockUIElement = new MockUIElement(global.core, {
                            clientKey,
                            loadingContext,
                            // @ts-ignore test
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockUIElement);
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

                        // @ts-ignore test
                        const mockUIElement = new MockUIElement(global.core, {
                            clientKey,
                            loadingContext,
                            // @ts-ignore test
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockUIElement);
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

                        // @ts-ignore test
                        const mockUIElement = new MockUIElement(global.core, {
                            clientKey,
                            loadingContext,
                            // @ts-ignore test
                            brands: [visa, 'mc']
                        });
                        const bin = { binValue: '', type: '', encryptedBin: 'xxx-xxx', uuid: requestId };
                        const lookUpBin = triggerBinLookUp(mockUIElement);
                        lookUpBin(bin);
                        await new Promise(process.nextTick);

                        expect(mockProcessBinLookupResponse).toHaveBeenCalledWith(
                            expect.objectContaining({ supportedBrands: [{ brand: visa, supported: true }], showSocialSecurityNumber: true })
                        );
                    });
                });
            });
        });
    });
});
