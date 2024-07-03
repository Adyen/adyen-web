import useForm from './useForm';
import { renderHook, act } from '@testing-library/preact-hooks';
import { Form } from './types';

describe('useForm', () => {
    const defaultSchema = ['firstName', 'lastName'];
    type defaultSchemaType = {
        firstName: string;
        lastName: string;
    };
    const defaultData = { firstName: 'John' };

    describe('schema', () => {
        let useFormHook;

        it('should set a default schema', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema }));
            useFormHook = result;

            expect(useFormHook.current.schema).toEqual(defaultSchema);
            expect(useFormHook.current.data[defaultSchema[0]]).toEqual(null);
            expect(useFormHook.current.errors[defaultSchema[0]]).toEqual(null);
            expect(useFormHook.current.valid[defaultSchema[0]]).toEqual(false);
            expect(useFormHook.current.data[defaultSchema[1]]).toEqual(null);
            expect(useFormHook.current.valid[defaultSchema[1]]).toEqual(false);
            expect(useFormHook.current.errors[defaultSchema[1]]).toEqual(null);
        });

        it('should update the schema', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema }));
            useFormHook = result;

            void act(() => {
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
            const { result } = renderHook<unknown, Form<defaultSchemaType>>(() => useForm({ schema: defaultSchema, defaultData }));

            expect(result.current.data.firstName).toEqual(defaultData.firstName);
            expect(result.current.data.lastName).toEqual(null);
        });

        it('should set default data after changing the schema', () => {
            const { result } = renderHook(() => useForm({ schema: defaultSchema, defaultData }));

            void act(() => {
                result.current.setSchema(['email']);
            });

            expect(result.current.data['firstName']).toEqual(undefined);
            expect(result.current.valid['firstName']).toEqual(undefined);
            expect(result.current.errors['firstName']).toEqual(undefined);

            void act(() => {
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
            const { result } = renderHook<unknown, Form<defaultSchemaType>>(() => useForm({ schema: defaultSchema }));

            void act(() => {
                result.current.handleChangeFor('firstName')(firstNameValue);
            });

            expect(result.current.data.firstName).toBe(firstNameValue);
            expect(result.current.valid.firstName).toBe(true);
            expect(result.current.errors.firstName).toBe(null);
        });

        it('should format the value of a field using formatters', () => {
            const formatterMock = jest.fn();
            const { result } = renderHook(() => useForm({ schema: defaultSchema, formatters: { firstName: formatterMock } }));

            void act(() => {
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
                    },
                    fieldProblems: {
                        firstName: null,
                        lastName: null
                    }
                }
            };

            expect(formatterMock).toHaveBeenCalledWith(firstNameValue, fieldContext);
        });

        it('should set the value of a checkbox', () => {
            const { result } = renderHook<unknown, Form<defaultSchemaType>>(() => useForm({ schema: defaultSchema }));
            const mockEvent = { target: { type: 'checkbox' } };

            // call once to set to "checked"
            void act(() => {
                result.current.handleChangeFor('firstName')(mockEvent);
            });

            expect(result.current.data.firstName).toEqual(true);

            // call again to set to "unchecked
            void act(() => {
                result.current.handleChangeFor('firstName')(mockEvent);
            });

            expect(result.current.data.firstName).toEqual(false);
        });
    });
});
