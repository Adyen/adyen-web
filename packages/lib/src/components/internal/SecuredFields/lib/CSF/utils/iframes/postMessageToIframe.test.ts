import postMessageToIframe from './postMessageToIframe';

window.postMessage = jest.fn();

describe('Testing postMessageToIframe fny', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
    });

    test('postMessage not called since there is no window object', () => {
        postMessageToIframe({}, null, '*');

        expect(window.postMessage).not.toHaveBeenCalled();
    });

    test('postMessage called with expected data object', () => {
        const dataObj = {
            txVariant: 'card',
            fieldType: 'encryptedSecurityCode',
            focus: true,
            numKey: 654321
        };

        postMessageToIframe(dataObj, window, '*');

        expect(window.postMessage).toHaveBeenCalledTimes(1);

        expect(window.postMessage).toHaveBeenCalledWith(JSON.stringify(dataObj), '*');
    });
});
