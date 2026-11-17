import handleIOSTouchEvents from './handleIOSTouchEvents';

import ua from '../utils/userAgent';

const myCSF = {
    state: { type: 'card', registerFieldForIos: null, securedFields: {} as Record<string, { iframeRef: HTMLIFrameElement }> },
    props: { rootNode: { appendChild: jest.fn(() => {}), removeChild: jest.fn(() => {}) } },
    callbacks: {
        onTouchstartIOS: null
    },
    config: { keypadFix: false },
    touchstartListener: handleIOSTouchEvents.touchstartListener,
    touchendListener: handleIOSTouchEvents.touchendListener,
    handleTouchend: handleIOSTouchEvents.handleTouchend,
    hasGenuineTouchEvents: null,
    postMessageToAllIframes: null,
    destroyTouchendListener: null,
    destroyTouchstartListener: handleIOSTouchEvents.destroyTouchstartListener
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

    afterEach(() => {
        document.body.removeEventListener('touchend', myCSF.touchendListener);
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
        'Calling touchendListener and passing it an input element whose selectionStart getter throws (e.g. type="number") will not throw, and ' +
            'will still see destroyTouchendListener & postMessageToAllIframes called',
        () => {
            const myElement = makeElementWithAttribute('input', 'name', 'myInput');
            Object.defineProperty(myElement, 'selectionStart', {
                get() {
                    throw new DOMException("Failed to read the 'selectionStart' property", 'InvalidStateError');
                }
            });

            expect(() => {
                // @ts-ignore - it's just a test!
                myCSF.touchendListener({ target: myElement });
            }).not.toThrow();

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );

    test(
        'Calling handleTouchend and passing it an element that is not an input, when config.keypadFix = false, will see that destroyTouchendListener & postMessageToAllIframes are called, ' +
            'registerFieldForIos is set to false, and rootNode.appendChild & .removeChild are not called',
        () => {
            const myElement = makeElementWithAttribute('div', 'data-id', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchendListener({ target: myElement });

            expect(myCSF.props.rootNode.appendChild).not.toHaveBeenCalled();
            expect(myCSF.props.rootNode.removeChild).not.toHaveBeenCalled();

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.state.registerFieldForIos).toEqual(false);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );

    test(
        'Calling handleTouchend and passing it an element that is not an input, when config.keypadFix = true and a securedField has focus, will see that destroyTouchendListener & postMessageToAllIframes are called, ' +
            'registerFieldForIos is set to false, and rootNode.appendChild & .removeChild are called',
        () => {
            myCSF.config.keypadFix = true;
            const securedFieldIframe = document.createElement('iframe');
            myCSF.state.securedFields = { encryptedCardNumber: { iframeRef: securedFieldIframe } };
            document.body.appendChild(securedFieldIframe);
            securedFieldIframe.focus();

            const myElement = makeElementWithAttribute('div', 'data-id', 'myInput');

            // @ts-ignore - it's just a test!
            myCSF.touchendListener({ target: myElement });
            securedFieldIframe.remove();

            expect(myCSF.props.rootNode.appendChild).toHaveBeenCalled();
            expect(myCSF.props.rootNode.removeChild).toHaveBeenCalled();

            expect(myCSF.destroyTouchendListener).toHaveBeenCalled();

            expect(myCSF.state.registerFieldForIos).toEqual(false);

            expect(myCSF.postMessageToAllIframes).toHaveBeenCalledWith({ fieldType: 'webInternalElement', fieldClick: true });
        }
    );
});

describe("Testing CSF's handleIOSTouchEvents' keypadFix focus handling", () => {
    const wasIOS = ua.__IS_IOS;
    let paymentMethodButton: HTMLButtonElement;
    let csf: {
        state: { registerFieldForIos: boolean; securedFields: Record<string, { iframeRef: HTMLIFrameElement }> };
        props: { rootNode: HTMLElement };
        config: { keypadFix: boolean };
        postMessageToAllIframes: jest.Mock;
        touchendListener: (e: Event) => void;
        destroyTouchendListener: () => boolean;
    };

    beforeEach(() => {
        ua.__IS_IOS = true;
        const rootNode = document.createElement('div');
        const sfIframe = document.createElement('iframe');
        rootNode.appendChild(sfIframe);
        paymentMethodButton = document.createElement('button');
        document.body.append(rootNode, paymentMethodButton);
        csf = {
            state: { registerFieldForIos: false, securedFields: { encryptedCardNumber: { iframeRef: sfIframe } } },
            props: { rootNode },
            config: { keypadFix: true },
            postMessageToAllIframes: jest.fn(),
            touchendListener: handleIOSTouchEvents.touchendListener,
            destroyTouchendListener: handleIOSTouchEvents.destroyTouchendListener
        };
        csf.touchendListener = csf.touchendListener.bind(csf);
        csf.destroyTouchendListener = csf.destroyTouchendListener.bind(csf);
        handleIOSTouchEvents.handleTouchend.call(csf);
    });

    afterEach(() => {
        csf.destroyTouchendListener();
        ua.__IS_IOS = wasIOS;
        document.body.innerHTML = '';
    });

    test.each([
        ['an unrelated iframe inside the root', () => csf.props.rootNode.appendChild(document.createElement('iframe'))],
        ['an unrelated iframe outside the root', () => document.body.appendChild(document.createElement('iframe'))],
        ['the activated element', () => paymentMethodButton]
    ])('should keep focus on %s when no securedField has focus', (_, getFocusedEl) => {
        const focusedEl = getFocusedEl();
        focusedEl.focus();
        paymentMethodButton.dispatchEvent(new Event('touchend', { bubbles: true }));
        expect(document.activeElement).toBe(focusedEl);
    });
});

describe("Testing CSF's handleIOSTouchEvents' destroyTouchendListener functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        ua.__IS_IOS = false;

        myCSF.destroyTouchendListener = handleIOSTouchEvents.destroyTouchendListener;
    });

    test('Calling destroyTouchendListener will return false since this is not iOS', () => {
        const res = myCSF.destroyTouchendListener();

        expect(res).toEqual(false);
    });

    test('Calling destroyTouchendListener will return true since this is iOS', () => {
        ua.__IS_IOS = true;
        const res = myCSF.destroyTouchendListener();

        expect(res).toEqual(true);
    });
});

describe("Testing CSF's handleIOSTouchEvents' destroyTouchstartListener functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        ua.__IS_IOS = false;
    });

    test('Calling destroyTouchstartListener will return false since this is not iOS', () => {
        const res = myCSF.destroyTouchstartListener();

        expect(res).toEqual(false);
    });

    test('Calling destroyTouchstartListener will return true since this is iOS', () => {
        ua.__IS_IOS = true;
        const res = myCSF.destroyTouchstartListener();

        expect(res).toEqual(true);
    });
});
