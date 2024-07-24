import BaseElement from './BaseElement';
import { BaseElementProps } from './types';
import { mock } from 'jest-mock-extended';
import { ICore } from '../../../core/types';

class MyElement extends BaseElement<BaseElementProps> {}

describe('BaseElement', () => {
    let core;

    beforeAll(() => {
        core = mock<ICore>();
    });

    describe('formatProps', () => {
        test('should return props by default', () => {
            const baseElement = new MyElement(core);
            const props = { prop1: 'prop1' };
            // @ts-ignore Testing internal method
            expect(baseElement.formatProps(props)).toBe(props);
        });
    });

    describe('formatData', () => {
        test('should return an empty object by default', () => {
            const baseElement = new MyElement(core);
            // @ts-ignore Testing internal method
            expect(baseElement.formatData()).toEqual({});
        });
    });

    describe('get data', () => {
        test('returns an empty object by default', () => {
            const baseElement = new MyElement(core);
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
        });

        test('calls formatData to get the specific component output', () => {
            const baseElement = new MyElement(core);
            // @ts-ignore Testing internal method
            const spy = jest.spyOn(baseElement, 'formatData');
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
            expect(spy).toHaveBeenCalled();
        });

        test('return correct billingAddress data', () => {
            const Element = class extends BaseElement<{}> {
                constructor(core, props) {
                    super(core, props);
                }
                protected formatData(): any {
                    return { billingAddress: { firstName: 'bla' } };
                }
            };
            let element;
            element = new Element(global.core, { type: 'riverty' });
            expect(element.data).toEqual({ clientStateDataIndicator: true, billingAddress: { firstName: 'bla' } });
            element = new Element(global.core, { type: 'card' });
            expect(element.data).toEqual({ clientStateDataIndicator: true, billingAddress: {} });
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement(core);
            expect(() => baseElement.render()).toThrow();
        });
    });
});
