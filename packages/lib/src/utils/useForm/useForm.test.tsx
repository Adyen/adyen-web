import useForm from './useForm';
import { renderHook, act } from '@testing-library/preact-hooks';

describe('useForm', () => {
    const defaultSchema = ['firstName', 'lastName'];
    const defaultData = { firstName: 'John' };

    describe('schema', () => {
        let useFormHook;
        beforeEach(() => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema }));
            useFormHook = result;
        });

        it('should set a default schema', () => {
            expect(useFormHook.current.schema).toEqual(defaultSchema);
            expect(useFormHook.current.data[defaultSchema[0]]).toEqual(null);
            expect(useFormHook.current.errors[defaultSchema[0]]).toEqual(null);
            expect(useFormHook.current.valid[defaultSchema[0]]).toEqual(false);
            expect(useFormHook.current.data[defaultSchema[1]]).toEqual(null);
            expect(useFormHook.current.valid[defaultSchema[1]]).toEqual(false);
            expect(useFormHook.current.errors[defaultSchema[1]]).toEqual(null);
        });

        it('should update the schema', () => {
            act(() => {
                useFormHook.current.setSchema(['email']);
            });

            expect(useFormHook.current.schema).toEqual(['email']);
            expect(useFormHook.current.data['email']).toEqual(null);
            expect(useFormHook.current.valid['email']).toEqual(false);
            expect(useFormHook.current.errors['email']).toEqual(null);
        });
    });

    describe('defaultData', () => {
        it('should set defaultData', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema, defaultData }));

            expect(result.current.data.firstName).toEqual(defaultData.firstName);
            expect(result.current.data.lastName).toEqual(null);
        });

        it('should set default data after changing the schema', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema, defaultData }));

            act(() => {
                result.current.setSchema(['email']);
            });

            expect(result.current.data['firstName']).toEqual(undefined);
            expect(result.current.valid['firstName']).toEqual(undefined);
            expect(result.current.errors['firstName']).toEqual(undefined);

            act(() => {
                result.current.setSchema(['firstName', 'email']);
            });

            expect(result.current.data['firstName']).toEqual(defaultData.firstName);
            expect(result.current.valid['firstName']).toEqual(true);
            expect(result.current.errors['firstName']).toEqual(null);
        });
    });

    describe('handleChangeFor', () => {
        const firstNameValue = 'John';

        it('should handle changes for a field', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema }));

            act(() => {
                result.current.handleChangeFor('firstName')(firstNameValue);
            });

            expect(result.current.data.firstName).toBe(firstNameValue);
            expect(result.current.valid.firstName).toBe(true);
            expect(result.current.errors.firstName).toBe(null);
        });

        it('should format the value of a field using formatters', () => {
            const formatterMock = jest.fn();
            const { result } = renderHook(() => useForm({ schema: defaultSchema, formatters: { firstName: formatterMock } }));

            act(() => {
                result.current.handleChangeFor('firstName')(firstNameValue);
            });

            const fieldContext = {
                state: {
                    data: {
                        firstName: null,
                        lastName: null
                    },
                    errors: {
                        firstName: null,
                        lastName: null
                    },
                    schema: ['firstName', 'lastName'],
                    valid: {
                        firstName: false,
                        lastName: false
                    }
                }
            };

            expect(formatterMock).toHaveBeenCalledWith(firstNameValue, fieldContext);
        });

        it('should set the value of a checkbox', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema }));
            const mockEvent = { target: { type: 'checkbox' } };

            // call once to set to "checked"
            act(() => {
                result.current.handleChangeFor('firstName')(mockEvent);
            });

            expect(result.current.data.firstName).toEqual(true);

            // call again to set to "unchecked
            act(() => {
                result.current.handleChangeFor('firstName')(mockEvent);
            });

            expect(result.current.data.firstName).toEqual(false);
        });
    });
});
