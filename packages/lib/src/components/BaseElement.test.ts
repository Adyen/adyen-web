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

        test('return correct billingAddress data', () => {
            const Element = class extends BaseElement<{}> {
                constructor(props) {
                    super(props);
                }
                protected formatData(): any {
                    return { billingAddress: { firstName: 'bla' } };
                }
            };
            let element;
            element = new Element({ type: 'riverty' });
            expect(element.data).toEqual({ clientStateDataIndicator: true, billingAddress: { firstName: 'bla' } });
            element = new Element({ type: 'card' });
            expect(element.data).toEqual({ clientStateDataIndicator: true, billingAddress: {} });
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement();
            expect(() => baseElement.render()).toThrow();
        });
    });
});
