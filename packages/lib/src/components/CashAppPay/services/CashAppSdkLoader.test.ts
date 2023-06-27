import { CashAppSdkLoader } from './CashAppSdkLoader';
import Script from '../../../utils/Script';
import { CASHAPPPAY_PROD_SDK, CASHAPPPAY_SANDBOX_SDK } from './config';
import { ICashAppWindowObject } from './types';
import { mock } from 'jest-mock-extended';

const mockLoad = jest.fn().mockImplementation(() => {
    const mockCashAppWindowObj = mock<ICashAppWindowObject>();
    Object.defineProperty(window, 'CashApp', mockCashAppWindowObj);
    return Promise.resolve(true);
});
jest.mock('../../../utils/Script', () => {
    return jest.fn().mockImplementation(() => {
        return { load: mockLoad };
    });
});

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    Script.mockClear();
    mockLoad.mockClear();
});

test('should load CashAppPay sandbox SDK if env is test', async () => {
    const sdkLoader = new CashAppSdkLoader();
    const cashAppWindowObj = await sdkLoader.load('test');

    expect(Script).toHaveBeenCalledWith(CASHAPPPAY_SANDBOX_SDK);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    // @ts-ignore CashApp is created by the Cash App SDK
    expect(cashAppWindowObj).toEqual(window.CashApp);
});

test('should load CashAppPay production SDK if env is live', async () => {
    const sdkLoader = new CashAppSdkLoader();
    const cashAppWindowObj = await sdkLoader.load('live-us');

    expect(Script).toHaveBeenCalledWith(CASHAPPPAY_PROD_SDK);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    // @ts-ignore CashApp is created by the Cash App SDK
    expect(cashAppWindowObj).toEqual(window.CashApp);
});
