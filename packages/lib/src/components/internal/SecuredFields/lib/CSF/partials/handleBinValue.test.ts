import { handleBinValue } from './handleBinValue';

const csfState = { type: 'card' };
const csfProps = {};
const csfConfig = {};
const csfCallbacks = { onBinValue: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

const feedbackObj_min = {
    action: 'binValue',
    binValue: '5',
    fieldType: 'encryptedCardNumber',
    numKey: 419658698
};

const feedbackObj_max = {
    action: 'binValue',
    binValue: '550000',
    encryptedBin: 'eyJhbGcx',
    uuid: '1d89f5b8',
    fieldType: 'encryptedCardNumber',
    numKey: 419658698
};

let onBinValueCallbackObj = null;

csfCallbacks.onBinValue = jest.fn(callbackObj => {
    onBinValueCallbackObj = callbackObj;
    console.log('### handleFocus.test::onBinValue callback called:: callbackObj', callbackObj);
});

const expectedCallbackObj_min = {
    binValue: '5',
    type: 'card'
};

const expectedCallbackObj_max = {
    binValue: '550000',
    type: 'card',
    encryptedBin: 'eyJhbGcx',
    uuid: '1d89f5b8'
};

const callHandleBinValue = feedbackObj => {
    // @ts-ignore - test is faking setup object
    handleBinValue(CSFObj, feedbackObj);
};

describe('Testing CSFs handleBinValue functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        onBinValueCallbackObj = null;
    });

    test('handleBinValue should call callback with a minimal callback object since no encryptedBin is present', () => {
        callHandleBinValue(feedbackObj_min);

        expect(csfCallbacks.onBinValue).toHaveBeenCalledTimes(1);
        expect(onBinValueCallbackObj).toEqual(expectedCallbackObj_min);
    });

    test('handleBinValue should call callback with a larger callback object since encryptedBin is present', () => {
        callHandleBinValue(feedbackObj_max);

        expect(csfCallbacks.onBinValue).toHaveBeenCalledTimes(2);
        expect(onBinValueCallbackObj).toEqual(expectedCallbackObj_max);
    });
});
