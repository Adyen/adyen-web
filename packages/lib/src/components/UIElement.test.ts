import UIElement from './UIElement';

describe('UIElement', () => {
    describe('onComplete', () => {
        test('calls the passed onComplete function', () => {
            const onComplete = jest.fn();
            const uiElement = new UIElement({ onComplete });
            uiElement.onComplete({});
            expect(onComplete.mock.calls.length).toBe(1);
        });
    });

    describe('onChange', () => {
        test('calls the passed onChange function', () => {
            const onChange = jest.fn();
            const uiElement = new UIElement({ onChange });
            uiElement.onChange();
            expect(onChange.mock.calls.length).toBe(1);
        });

        test('does not trigger the onValid method if the component is not valid', () => {
            const onValid = jest.fn();
            const uiElement = new UIElement({ onValid });
            uiElement.onChange();
            expect(onValid.mock.calls.length).toBe(0);
        });

        test('triggers the onValid method if the component is valid', () => {
            const onValid = jest.fn();
            class MyElement extends UIElement {
                get isValid() {
                    return true;
                }
            }

            const myElement = new MyElement({ onValid });
            myElement.onChange();
            expect(onValid.mock.calls.length).toBe(1);
        });
    });

    describe('isValid', () => {
        test('should be false by default', () => {
            const uiElement = new UIElement({});
            expect(uiElement.isValid).toBe(false);
        });
    });

    describe('onValid', () => {
        test('calls the passed onValid function', () => {
            const onValid = jest.fn((state, element) => {});
            const uiElement = new UIElement({ onValid });
            uiElement.onValid();
            expect(onValid.mock.calls.length).toBe(1);
        });
    });

    describe('showValidation', () => {
        test("calls component's showValidation method", () => {
            const showValidation = jest.fn();
            class MyElement extends UIElement {
                showValidation = () => showValidation();
            }

            const myElement = new MyElement({});
            myElement.showValidation();
            expect(showValidation.mock.calls.length).toBe(1);
        });
    });

    describe('get displayName', () => {
        test('returns the name prop', () => {
            const uiElement = new UIElement({ name: 'test123' });
            expect(uiElement.displayName).toEqual('test123');
        });

        test('returns the constructor type if no name prop is passed', () => {
            class MyElement extends UIElement {
                static type = 'test123';
            }

            const myElement = new MyElement({});
            expect(myElement.displayName).toEqual('test123');
        });
    });
});
