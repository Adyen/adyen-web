import BaseElement from './BaseElement';
import { BaseElementProps } from './types';
import { mock } from 'jest-mock-extended';
import { ICore } from '../core/types';

describe('BaseElement', () => {
    let MyElement;
    let core;

    beforeAll(() => {
        core = mock<ICore>();
        MyElement = class extends BaseElement<BaseElementProps> {};
    });

    describe('formatProps', () => {
        test('should return props by default', () => {
            const baseElement = new MyElement({ core });
            const props = { prop1: 'prop1' };
            expect(baseElement.formatProps(props)).toBe(props);
        });
    });

    describe('formatData', () => {
        test('should return an empty object by default', () => {
            const baseElement = new MyElement({ core });
            expect(baseElement.formatData()).toEqual({});
        });
    });

    describe('get data', () => {
        test('returns an empty object by default', () => {
            const baseElement = new MyElement({ core });
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
        });

        test('calls formatData to get the specific component output', () => {
            const baseElement = new MyElement({ core });
            const spy = jest.spyOn(baseElement, 'formatData');
            expect(baseElement.data).toEqual({ clientStateDataIndicator: true });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement({ core });
            expect(() => baseElement.render()).toThrow();
        });
    });
});
