import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import handleBrandFromBinLookup, { sendBrandToCardSF, sendExpiryDatePolicyToSF } from './handleBrandFromBinLookup';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

const myCSF = {
    // state: { type: 'card', securedFields: securedFieldsObj },
    // props: { rootNode: 'div' },
    // config: { allowedDOMAccess: true, autoFocus: false },
    // callbacks: {
    //     onFieldValid: jest.fn(obj => {
    //         console.log('### handleEncryption.test::callbacks.onFieldValid:: obj', obj);
    //     }),
    //     onError: null
    // },
    // handleEncryption,
    validateForm: jest.fn(() => {
        console.log('### handleEncryption.test::myCSF.validateForm:: ');
    })
    // setFocusOnFrame: null
};

describe('Testing CSFs handleBrandFromBinLookup functionality', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### handleEncryption.test::Mock FN call to postMessageToIframe:: ', obj));

    beforeEach(() => {
        // console.log = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();

        // myCSF.setFocusOnFrame = jest.fn(fieldType => {
        //     fieldToFocus = fieldType;
        // });
    });

    test('should...', () => {
        // expect(myCSF.validateForm).toHaveBeenCalledTimes();
    });
});
