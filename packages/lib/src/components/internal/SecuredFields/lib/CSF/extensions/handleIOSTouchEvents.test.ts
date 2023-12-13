// import { SecuredFields } from '../../types';
import handleIOSTouchEvents from './handleIOSTouchEvents';
// import { postMessageToAllIframes } from '../partials/postMessageToAllIframes';

// jest.mock('../partials/postMessageToAllIframes');

// const mockedPostMessageToAllIframes = postMessageToAllIframes as jest.Mock;

const myCSF = {
    state: { type: 'card', registerFieldForIos: null },
    props: { rootNode: 'div' },
    callbacks: {
        onTouchstartIOS: null
    },
    touchstartListener: handleIOSTouchEvents.touchstartListener,
    handleTouchend: handleIOSTouchEvents.handleTouchend,
    hasGenuineTouchEvents: null,
    postMessageToAllIframes: null
};

const makeElementWithAttribute = (elementType, attrName, attrValue) => {
    const myElement = document.createElement(elementType);
    myElement.setAttribute(attrName, attrValue);
    return myElement;
};

describe("Testing CSF's handleIOSTouchEvents' touchstartListener functionality", () => {
    // const postMessageToAllIframesMock = jest.fn(obj => console.log('### handleIOSTouchEvents.test::Mock FN call to postMessageToAllIframes:: ', obj));

    beforeEach(() => {
        // console.log = jest.fn(() => {});
        myCSF.hasGenuineTouchEvents = false;

        myCSF.postMessageToAllIframes = jest.fn(obj => {
            console.log('### handleTab.test:::: postMessageToAllIframes called with', obj);
        });

        myCSF.callbacks.onTouchstartIOS = jest.fn(obj => {
            console.log('### handleIOSTouchEvents.test:::: onTouchstartIOS callback called with', obj);
        });

        // mockedPostMessageToAllIframes.mockReset();
        // mockedPostMessageToAllIframes.mockImplementation(obj => postMessageToAllIframesMock(obj));
        // postMessageToAllIframesMock.mockClear();
    });

    test(
        'Calling touchstartListener and passing it an input element will see that hasGenuineTouchEvents is set to true, and ' +
            'that postMessageToAllIframes & callbacks.onTouchstartIOS are both called with the expected objects',
        async () => {
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
        async () => {
            // const myElement = document.createElement('span');
            // myElement.setAttribute('data-id', 'mySpan');

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
        async () => {
            // const myElement = document.createElement('div');
            // myElement.setAttribute('data-id', 'myDiv');

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
        // console.log = jest.fn(() => {});
        myCSF.state.registerFieldForIos = false;
    });

    test('Calling handleTouchend will set registerFieldForIos = true', async () => {
        myCSF.handleTouchend();

        expect(myCSF.state.registerFieldForIos).toEqual(true);
    });
});

// describe("Testing CSF's handleIOSTouchEvents' touchendListener functionality", () => {
//     beforeEach(() => {
//         // console.log = jest.fn(() => {});
//         myCSF.state.registerFieldForIos = false;
//     });
//
//     test('Calling handleTouchend will set registerFieldForIos = true', async () => {
//         const myElement = makeElementWithAttribute('input', 'name', 'myInput');
//
//         // @ts-ignore - it's just a test!
//         myCSF.touchendListener(myElement);
//
//         expect(myCSF.state.registerFieldForIos).toEqual(true);
//     });
// });
