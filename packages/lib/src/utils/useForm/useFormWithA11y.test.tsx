import { renderHook, act } from '@testing-library/preact-hooks';
import useFormWithA11y from './useFormWithA11y';
import { useErrorFocus } from './useErrorFocus';
import { setFocusOnField } from '../setFocus';
import { ValidatorMode } from '../Validator/types';

jest.mock('../setFocus', () => ({
    setFocusOnField: jest.fn()
}));

const mockSetFocusOnField = setFocusOnField as jest.Mock;

function getHookResult<T>(result: { current: T | undefined }): T {
    if (!result.current) throw new Error('Hook result is undefined');
    return result.current;
}

beforeEach(() => {
    mockSetFocusOnField.mockClear();
});

// ---------------------------------------------------------------------------
// useErrorFocus
// ---------------------------------------------------------------------------

describe('useErrorFocus', () => {
    it('focuses the first field that has an error, in schema order', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            getHookResult(result).focusFirstError({ firstName: null, lastName: { isValid: false } }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledTimes(1);
        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'lastName');
    });

    it('does nothing when there are no errors', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            getHookResult(result).focusFirstError({ firstName: null, lastName: null }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).not.toHaveBeenCalled();
    });

    it('uses the first error key according to the schema order, not the errors object key order', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useErrorFocus(holder));

        void act(() => {
            getHookResult(result).focusFirstError({ lastName: { isValid: false }, firstName: { isValid: false } }, ['firstName', 'lastName']);
        });

        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'firstName');
    });
});

// ---------------------------------------------------------------------------
// useFormWithA11y
// ---------------------------------------------------------------------------

describe('useFormWithA11y', () => {
    const schema = ['email', 'name'];
    type FormSchema = { email: string; name: string };

    const rules = {
        email: {
            validate: (value: string) => !!value,
            errorMessage: 'email.invalid',
            modes: ['blur'] as ValidatorMode[]
        },
        name: {
            validate: (value: string) => !!value,
            errorMessage: 'name.invalid',
            modes: ['blur'] as ValidatorMode[]
        }
    };

    it('does NOT focus any field when triggerValidation is NOT called (blur-time field change)', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useFormWithA11y<FormSchema>({ schema, rules, formHolder: holder }));

        void act(() => {
            getHookResult(result).handleChangeFor('email', 'blur')({ target: { value: '' } });
        });

        expect(mockSetFocusOnField).not.toHaveBeenCalled();
    });

    it('focuses the first error field after triggerValidation is called', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useFormWithA11y<FormSchema>({ schema, rules, formHolder: holder }));

        void act(() => {
            getHookResult(result).triggerValidation();
        });

        expect(mockSetFocusOnField).toHaveBeenCalledTimes(1);
        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'email');
    });

    it('focuses the correct first error field when only later schema fields are invalid', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() =>
            useFormWithA11y<FormSchema>({ schema, rules, formHolder: holder, defaultData: { email: 'valid@email.com', name: '' } })
        );

        void act(() => {
            getHookResult(result).triggerValidation();
        });

        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'name');
    });

    it('does NOT focus any field after triggerValidation when the form is fully valid', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() =>
            useFormWithA11y<FormSchema>({
                schema,
                rules,
                formHolder: holder,
                defaultData: { email: 'valid@email.com', name: 'John' }
            })
        );

        void act(() => {
            getHookResult(result).triggerValidation();
        });

        expect(mockSetFocusOnField).not.toHaveBeenCalled();
    });

    it('uses the current schema at the time triggerValidation is called (no stale closure)', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useFormWithA11y<FormSchema>({ schema: ['email'], rules, formHolder: holder }));

        void act(() => {
            getHookResult(result).setSchema(['name']);
        });

        void act(() => {
            getHookResult(result).triggerValidation();
        });

        // Should focus 'name' (from the updated schema), NOT 'email' (stale schema)
        expect(mockSetFocusOnField).toHaveBeenCalledWith(holder, 'name');
    });

    it('returns all Form interface methods from the underlying useForm', () => {
        const holder = document.createElement('div');
        const { result } = renderHook(() => useFormWithA11y<FormSchema>({ schema, rules, formHolder: holder }));
        const form = getHookResult(result);

        expect(typeof form.handleChangeFor).toBe('function');
        expect(typeof form.triggerValidation).toBe('function');
        expect(typeof form.setSchema).toBe('function');
        expect(typeof form.setData).toBe('function');
        expect(typeof form.setErrors).toBe('function');
        expect(typeof form.setValid).toBe('function');
        expect(typeof form.mergeData).toBe('function');
        expect(typeof form.mergeForm).toBe('function');
        expect(typeof form.setFieldProblems).toBe('function');
        expect(form.schema).toEqual(schema);
    });
});
