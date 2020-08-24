import BaseElement from './BaseElement';

describe('BaseElement', () => {
    let MyElement;

    beforeAll(() => {
        MyElement = class extends BaseElement<{}> {};
    });

    describe('formatProps', () => {
        test('should return props by default', () => {
            const baseElement = new MyElement({});
            const props = { prop1: 'prop1' };
            expect(baseElement.formatProps(props)).toBe(props);
        });
    });

    describe('formatData', () => {
        test('should return an empty object by default', () => {
            const baseElement = new MyElement();
            expect(baseElement.formatData()).toEqual({});
        });
    });

    describe('get data', () => {
        test('returns an empty object by default', () => {
            const baseElement = new MyElement();
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
        });

        test('calls formatData to get the specific component output', () => {
            const baseElement = new MyElement();
            const spy = jest.spyOn(baseElement, 'formatData');
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement();
            expect(() => baseElement.render()).toThrow();
        });
    });
});
