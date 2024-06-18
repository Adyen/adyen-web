import { createSecuredFields, setupSecuredField } from './createSecuredFields';
import { DATA_ENCRYPTED_FIELD_ATTR, ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, SF_CONFIG_TIMEOUT } from '../../constants';
import { SecuredFields } from '../../types';
import SecuredField from '../../securedField/SecuredField';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock('../../securedField/SecuredField');

const mockedSecuredField = SecuredField as jest.Mock;

window._b$dl = true; // to cover some missing lines

let MySecuredField;

const myCSF = {
    state: { type: 'card', hasSeparateDateFields: null, securedFields: {} as SecuredFields, iframeCount: 0, originalNumIframes: 2, numIframes: 2 },
    config: {},
    props: { rootNode: null, i18n: global.i18n, shouldDisableIOSArrowKeys: null },
    callbacks: {
        onLoad: jest.fn(() => {}),
        onTouchstartIOS: jest.fn(() => {}),
        onKeyPressed: jest.fn(() => {})
    },
    createSecuredFields,
    setupSecuredField,
    createNonCardSecuredFields: jest.fn(() => {}),
    encryptedAttrName: DATA_ENCRYPTED_FIELD_ATTR,
    destroySecuredFields: jest.fn(() => {
        console.log('### createSecuredFields.test::calling destroySecuredFields:: ');
    }),
    handleIframeConfigFeedback: jest.fn(obj => {
        console.log('### createSecuredFields.test::calling handleIframeConfigFeedback:: with', obj);
    }),
    handleFocus: jest.fn(() => {}),
    handleBinValue: jest.fn(() => {}),
    handleSFShiftTab: jest.fn(() => {}),
    handleEncryption: jest.fn(() => {}),
    handleValidation: jest.fn(() => {}),
    processAutoComplete: jest.fn(() => {}),
    hasGenuineTouchEvents: null,
    postMessageToAllIframes: jest.fn(() => {})
};

const makeDiv = encName => {
    const myDiv = document.createElement('div');
    myDiv.setAttribute(DATA_ENCRYPTED_FIELD_ATTR, encName);
    return myDiv;
};

const dummyObj = { foo: 'bar' };
const dummyObjWithNumKey = { foo: 'bar', numKey: 1234 };

describe('Testing CSFs setupSecuredField functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
        console.warn = jest.fn(() => {});

        MySecuredField = {
            fieldType: ENCRYPTED_CARD_NUMBER,
            onIframeLoadedCallback: null,
            onConfigCallback: null,
            onFocusCallback: null,
            onBinValueCallback: null,
            onTouchstartCallback: null,
            onShiftTabCallback: null,
            onEncryptionCallback: null,
            onValidationCallback: null,
            onAutoCompleteCallback: null,
            onKeyPressedCallback: null,
            onIframeLoaded: cbFn => {
                MySecuredField.onIframeLoadedCallback = cbFn;
                return MySecuredField;
            },
            onConfig: cbFn => {
                MySecuredField.onConfigCallback = cbFn;
                return MySecuredField;
            },
            onFocus: cbFn => {
                MySecuredField.onFocusCallback = cbFn;
                return MySecuredField;
            },
            onBinValue: cbFn => {
                MySecuredField.onBinValueCallback = cbFn;
                return MySecuredField;
            },
            onTouchstart: cbFn => {
                MySecuredField.onTouchstartCallback = cbFn;
                return MySecuredField;
            },
            onShiftTab: cbFn => {
                MySecuredField.onShiftTabCallback = cbFn;
                return MySecuredField;
            },
            onEncryption: cbFn => {
                MySecuredField.onEncryptionCallback = cbFn;
                return MySecuredField;
            },
            onValidation: cbFn => {
                MySecuredField.onValidationCallback = cbFn;
                return MySecuredField;
            },
            onAutoComplete: cbFn => {
                MySecuredField.onAutoCompleteCallback = cbFn;
                return MySecuredField;
            },
            onKeyPressed: cbFn => {
                MySecuredField.onKeyPressedCallback = cbFn;
                return MySecuredField;
            }
        };
        const SecuredFieldMock = jest.fn(() => MySecuredField);

        mockedSecuredField.mockReset();
        mockedSecuredField.mockImplementation(() => SecuredFieldMock());
        SecuredFieldMock.mockClear();
    });

    test('Calling setupSecuredField with an unsupported value for the data-cse attribute should see that a SF is not created and that a warning is given', () => {
        const rootNode = document.createElement('div');
        const unsupportedEl = makeDiv('encryptedCustomField');
        rootNode.appendChild(unsupportedEl);
        myCSF.props.rootNode = rootNode;

        const numIframes: number = myCSF.createSecuredFields();

        expect(numIframes).toEqual(0);

        expect(console.warn).toBeCalledWith(
            `WARNING: 'encryptedCustomField' is not a valid type for the '${DATA_ENCRYPTED_FIELD_ATTR}' attribute. A SecuredField will not be created for this element.`
        );

        expect(myCSF.createNonCardSecuredFields).toBeCalledWith([]);
    });

    test('Calling setupSecuredField to see that an "encryptedCardNumber" SF is created and stored in state', () => {
        myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

        expect(myCSF.state.securedFields.encryptedCardNumber).not.toEqual(null);
    });

    test('Calling to see that an "encryptedExpiryYear" SF is created and stored in state and that we register the fact that we have separate date fields', () => {
        myCSF.setupSecuredField(makeDiv('encryptedExpiryYear'));

        expect(myCSF.state.hasSeparateDateFields).toEqual(true);
        expect(myCSF.state.securedFields.encryptedExpiryYear).not.toEqual(null);
    });

    test(
        'Calling setupSecuredField to see that the expected onIframeLoadedCallback is set.' +
            'Running the onIframeLoadedCallback callback sees the iframeCount increases, but because all expected iframes have not been loaded, ' +
            'the onLoad callback is not called; and we force the config timeout to see that the promise rejects',
        () => {
            const prom = myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            expect(MySecuredField.onIframeLoadedCallback).not.toEqual(null);
            MySecuredField.onIframeLoadedCallback();

            expect(myCSF.state.iframeCount).toEqual(1);
            expect(myCSF.callbacks.onLoad).not.toHaveBeenCalled();

            // Fast-forward until config related timer has been executed
            jest.runAllTimers();

            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), SF_CONFIG_TIMEOUT);

            return expect(prom).rejects.toEqual({ type: ENCRYPTED_CARD_NUMBER, failReason: 'sf took too long to config' });
        }
    );

    test(
        'Calling setupSecuredField to see that the expected onIframeLoadedCallback is set.' +
            'Running the onIframeLoadedCallback callback sees the iframeCount increases, and because all expected iframes have been loaded, the onLoad callback is called',
        () => {
            myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            expect(MySecuredField.onIframeLoadedCallback).not.toEqual(null);
            MySecuredField.onIframeLoadedCallback();

            expect(myCSF.state.iframeCount).toEqual(2);
            expect(myCSF.callbacks.onLoad).toHaveBeenCalledWith({ iframesLoaded: true });
        }
    );

    test(
        'Calling setupSecuredField to see that the expected onIframeLoadedCallback is set. ' +
            'Running the onIframeLoadedCallback callback again sees the iframeCount increases, and because we now exceed the expected number of iframes have been loaded, ' +
            'the destroySecuredFields function is called and we throw an error',
        () => {
            myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            expect(MySecuredField.onIframeLoadedCallback).not.toEqual(null);

            expect(() => MySecuredField.onIframeLoadedCallback()).toThrow(
                'One or more securedFields has just loaded new content. This should never happen. securedFields have been removed.\n                        iframe load count=3. Expected count:2'
            );

            expect(myCSF.state.iframeCount).toEqual(3);
            expect(myCSF.destroySecuredFields).toHaveBeenCalled();
        }
    );

    test(
        'Calling setupSecuredField to see that the expected onConfigCallback callback is set. Running it sees that an object is passed through to the relevant callback function, ' +
            'and that the promise is resolved',
        () => {
            const prom = myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            // onConfigCallback
            expect(MySecuredField.onConfigCallback).not.toEqual(null);

            MySecuredField.onConfigCallback(dummyObj);
            expect(myCSF.handleIframeConfigFeedback).toHaveBeenCalledWith(dummyObj);

            return expect(prom).resolves.toBe(dummyObj);
        }
    );

    test(
        'Calling setupSecuredField to see that expected onTouchstartCallback is set. Running it sees that because myCSF is not configured to allow it ' +
            '- the callback function and postMessageToAllIframes are not called',
        () => {
            myCSF.props.shouldDisableIOSArrowKeys = true;
            myCSF.hasGenuineTouchEvents = false;

            myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            expect(MySecuredField.onTouchstartCallback).not.toEqual(null);

            MySecuredField.onTouchstartCallback({ fieldType: ENCRYPTED_CARD_NUMBER });

            expect(myCSF.callbacks.onTouchstartIOS).not.toHaveBeenCalled();

            expect(myCSF.postMessageToAllIframes).not.toHaveBeenCalled();
        }
    );

    test(
        'Calling setupSecuredField to see that expected onTouchstartCallback is set. Running it sees that because myCSF is configured to allow it ' +
            '- an object is passed through to the relevant callback function, and that postMessageToAllIframes is called ',
        () => {
            myCSF.hasGenuineTouchEvents = true;

            myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

            expect(MySecuredField.onTouchstartCallback).not.toEqual(null);

            MySecuredField.onTouchstartCallback({ fieldType: ENCRYPTED_CARD_NUMBER });

            expect(myCSF.callbacks.onTouchstartIOS).toHaveBeenCalledWith({ fieldType: ENCRYPTED_CARD_NUMBER });

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: ENCRYPTED_CARD_NUMBER, fieldClick: true });
        }
    );

    test(
        'Calling setupSecuredField to see that expected onTouchstartCallback is set. Running it sees that, because, between then, myCSF & the feedback object are configured to allow it ' +
            '- an object is passed through to the relevant callback function, and that postMessageToAllIframes is called ',
        () => {
            myCSF.hasGenuineTouchEvents = false;

            myCSF.setupSecuredField(makeDiv(ENCRYPTED_EXPIRY_DATE));

            expect(MySecuredField.onTouchstartCallback).not.toEqual(null);

            MySecuredField.onTouchstartCallback({ fieldType: ENCRYPTED_EXPIRY_DATE, hasGenuineTouchEvents: true });

            expect(myCSF.callbacks.onTouchstartIOS).toHaveBeenCalledWith({ fieldType: ENCRYPTED_EXPIRY_DATE });

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: ENCRYPTED_EXPIRY_DATE, fieldClick: true });
        }
    );

    test('Calling setupSecuredField to see that the remaining, expected callbacks are set. Running them sees that an object is passed through to the relevant callback function', () => {
        myCSF.setupSecuredField(makeDiv(ENCRYPTED_CARD_NUMBER));

        // onFocusCallback;
        expect(MySecuredField.onFocusCallback).not.toEqual(null);

        MySecuredField.onFocusCallback(dummyObj);
        expect(myCSF.handleFocus).toHaveBeenCalledWith(dummyObj);

        // onBinValueCallback
        expect(MySecuredField.onBinValueCallback).not.toEqual(null);

        MySecuredField.onBinValueCallback(dummyObj);
        expect(myCSF.handleBinValue).toHaveBeenCalledWith(dummyObj);

        // onShiftTabCallback
        expect(MySecuredField.onShiftTabCallback).not.toEqual(null);

        MySecuredField.onShiftTabCallback({ fieldType: ENCRYPTED_CARD_NUMBER });
        expect(myCSF.handleSFShiftTab).toHaveBeenCalledWith(ENCRYPTED_CARD_NUMBER);

        // onEncryptionCallback
        expect(MySecuredField.onEncryptionCallback).not.toEqual(null);

        MySecuredField.onEncryptionCallback(dummyObj);
        expect(myCSF.handleEncryption).toHaveBeenCalledWith(dummyObj);

        // onValidationCallback
        expect(MySecuredField.onValidationCallback).not.toEqual(null);

        MySecuredField.onValidationCallback(dummyObj);
        expect(myCSF.handleValidation).toHaveBeenCalledWith(dummyObj);

        // onAutoCompleteCallback
        expect(MySecuredField.onAutoCompleteCallback).not.toEqual(null);

        MySecuredField.onAutoCompleteCallback(dummyObj);
        expect(myCSF.processAutoComplete).toHaveBeenCalledWith(dummyObj);

        // onKeyPressedCallback
        expect(MySecuredField.onKeyPressedCallback).not.toEqual(null);

        MySecuredField.onKeyPressedCallback(dummyObjWithNumKey);
        expect(myCSF.callbacks.onKeyPressed).toHaveBeenCalledWith(dummyObj); // checking that numKey prop gets removed
    });
});
