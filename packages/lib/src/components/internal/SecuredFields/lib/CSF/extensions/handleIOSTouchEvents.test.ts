import handleIOSTouchEvents from './handleIOSTouchEvents';

const myCSF = {
    state: { type: 'card', registerFieldForIos: null },
    props: { rootNode: document.createElement('div') },
    callbacks: {
        onTouchstartIOS: null
    },
    config: { keypadFix: false },
    touchstartListener: handleIOSTouchEvents.touchstartListener,
    touchendListener: handleIOSTouchEvents.touchendListener,
    handleTouchend: handleIOSTouchEvents.handleTouchend,
    hasGenuineTouchEvents: null,
    postMessageToAllIframes: null,
    destroyTouchendListener: null
};

const makeElementWithAttribute = (elementType, attrName, attrValue) => {
    const myElement = document.createElement(elementType);
    myElement.setAttribute(attrName, attrValue);
    return myElement;
};

describe("Testing CSF's handleIOSTouchEvents' touchstartListener functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
        myCSF.hasGenuineTouchEvents = false;

        myCSF.postMessageToAllIframes = jest.fn(() => {});

        myCSF.callbacks.onTouchstartIOS = jest.fn(() => {});
    });

    test(
        'Calling touchstartListener and passing it an input element will see that hasGenuineTouchEvents is set to true, and ' +
            'that postMessageToAllIframes & callbacks.onTouchstartIOS are both called with the expected objects',
        () => {
            const myElement = makeElementWithAttribute('input', 'name', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchstartListener({ target: myElement });

            expect(myCSF.hasGenuineTouchEvents).toEqual(true);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', checkoutTouchEvent: true });
            expect(myCSF.callbacks.onTouchstartIOS).toHaveBeenCalledWith({ fieldType: 'webInternalElement', name: 'myInput' });
        }
    );

    test(
        'Calling touchstartListener and passing it a span element will see that hasGenuineTouchEvents is set to true, and ' +
            'that postMessageToAllIframes & callbacks.onTouchstartIOS are both called with the expected objects',
        () => {
            const myElement = makeElementWithAttribute('span', 'data-id', 'mySpan');

            // @ts-ignore - it's just a test!
            myCSF.touchstartListener({ target: myElement });

            expect(myCSF.hasGenuineTouchEvents).toEqual(true);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', checkoutTouchEvent: true });
            expect(myCSF.callbacks.onTouchstartIOS).toHaveBeenCalledWith({ fieldType: 'webInternalElement', name: 'mySpan' });
        }
    );

    test(
        'Calling touchstartListener and passing it an element that is not an input or a span will see that hasGenuineTouchEvents is set to true, but ' +
            'postMessageToAllIframes & callbacks.onTouchstartIOS will not be called',
        () => {
            const myElement = makeElementWithAttribute('div', 'data-id', 'myDiv');

            // @ts-ignore - it's just a test!
            myCSF.touchstartListener({ target: myElement });

            expect(myCSF.hasGenuineTouchEvents).toEqual(true);

            expect(myCSF.postMessageToAllIframes).not.toHaveBeenCalled();
            expect(myCSF.callbacks.onTouchstartIOS).not.toHaveBeenCalled();
        }
    );
});

describe("Testing CSF's handleIOSTouchEvents' handleTouchend functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
        myCSF.state.registerFieldForIos = false;
    });

    test('Calling handleTouchend will set registerFieldForIos = true', () => {
        myCSF.handleTouchend();

        expect(myCSF.state.registerFieldForIos).toEqual(true);
    });
});

describe("Testing CSF's handleIOSTouchEvents' touchendListener functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
        myCSF.state.registerFieldForIos = null;

        myCSF.postMessageToAllIframes = jest.fn(() => {});

        myCSF.destroyTouchendListener = jest.fn(() => {});
    });

    test(
        'Calling handleTouchend and passing it an input element will see that destroyTouchendListener & postMessageToAllIframes are called, and ' +
            'registerFieldForIos will be set to false',
        () => {
            const myElement = makeElementWithAttribute('input', 'name', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchendListener({ target: myElement });

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.state.registerFieldForIos).toEqual(false);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );

    test(
        'Calling handleTouchend and passing it an element that is not an input, when config.keypadFix = false, will see that destroyTouchendListener & postMessageToAllIframes are called, and ' +
            'registerFieldForIos will be set to false',
        () => {
            const myElement = makeElementWithAttribute('div', 'data-id', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchendListener({ target: myElement });

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.state.registerFieldForIos).toEqual(false);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );

    test(
        'Calling handleTouchend and passing it an element that is not an input, when config.keypadFix = true, will see that destroyTouchendListener & postMessageToAllIframes are called, and ' +
            'registerFieldForIos will be set to false',
        () => {
            myCSF.config.keypadFix = true;

            const myElement = makeElementWithAttribute('div', 'data-id', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchendListener({ target: myElement });

            // TODO ?? set a removeChild function on rootNode and see if it is called ??

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.state.registerFieldForIos).toEqual(false);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );
});

// TODO test destroyTouchendListener & destroyTouchstartListener
