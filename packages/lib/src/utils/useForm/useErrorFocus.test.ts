import { renderHook, act } from '@testing-library/preact-hooks';
import { RefObject } from 'preact';
import { useErrorFocus } from './useErrorFocus';
import { setFocusOnField } from '../setFocus';

jest.mock('../setFocus', () => ({
    setFocusOnField: jest.fn()
}));

const mockSetFocusOnField = setFocusOnField as jest.Mock;

beforeEach(() => {
    mockSetFocusOnField.mockClear();
});

describe('useErrorFocus', () => {
    it('focuses the first field that has an error, in schema order', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            result.current.focusFirstError({ firstName: null, lastName: { isValid: false } }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledTimes(1);
        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'lastName');
    });

    it('does nothing when there are no errors', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            result.current.focusFirstError({ firstName: null, lastName: null }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).not.toHaveBeenCalled();
    });

    it('uses the first error key according to the schema order, not the errors object key order', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            result.current.focusFirstError({ lastName: { isValid: false }, firstName: { isValid: false } }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'firstName');
    });

    it('accepts a CSS selector string and passes it directly to setFocusOnField', () => {
        const selector = '#my-form';
        const { result } = renderHook(() => useErrorFocus(selector));

        void act(() => {
            result.current.focusFirstError({ email: { isValid: false } }, ['email']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledTimes(1);
        expect(mockSetFocusOnField).toHaveBeenCalledWith(selector, 'email');
    });

    it('resolves a mounted RefObject and passes its current element to setFocusOnField', () => {
        const element = document.createElement('div');
        const ref: RefObject<Element> = { current: element };
        const { result } = renderHook(() => useErrorFocus(ref));

        void act(() => {
            result.current.focusFirstError({ email: { isValid: false } }, ['email']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledTimes(1);
        expect(mockSetFocusOnField).toHaveBeenCalledWith(element, 'email');
    });

    it('does not call setFocusOnField when RefObject is unmounted (current is null)', () => {
        const ref: RefObject<Element> = { current: null };
        const { result } = renderHook(() => useErrorFocus(ref));

        void act(() => {
            result.current.focusFirstError({ email: { isValid: false } }, ['email']);
        });

        expect(mockSetFocusOnField).not.toHaveBeenCalled();
    });
});
