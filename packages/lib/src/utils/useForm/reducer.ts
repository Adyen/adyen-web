import { FormAction, FormInitArg, FormState, FormStateErrors, FormStateValid, ProcessFieldType } from './types';

const omitKeys = <O extends object>(obj: O, omit: string[]) =>
    Object.keys(obj)
        .filter(k => !omit.includes(k))
        .reduce((a, c) => {
            a[c] = obj[c];
            return a;
        }, {});

const addKeys = <O>(obj: O, add: string[], initialValue: unknown, defaultData: O, pendingData: O) =>
    add.reduce((a, c) => ({ ...a, [c]: a[c] ?? pendingData?.[c] ?? defaultData?.[c] ?? initialValue }), obj);

/**
 * Processes default data and sets as default in state
 */
export function init<FormSchema>({ schema, defaultData, processField, fieldProblems }: FormInitArg<FormSchema>) {
    const getProcessedState = (fieldKey: string) => {
        if (defaultData[fieldKey] === undefined) return { valid: false, errors: null, data: null, fieldProblems: fieldProblems?.[fieldKey] ?? null };

        const [formattedValue, validationResult] = processField(
            { key: fieldKey, value: defaultData[fieldKey], mode: 'blur' },
            { state: { data: defaultData } }
        );

        return {
            valid: (validationResult.isValid && !fieldProblems?.[fieldKey]) || false,
            errors: validationResult.hasError() ? validationResult.getError() : null,
            data: formattedValue,
            fieldProblems: fieldProblems?.[fieldKey] ?? null
        };
    };

    const formData = schema.reduce(
        (acc: Pick<FormState<Record<string, unknown>>, 'data' | 'valid' | 'errors' | 'fieldProblems'>, fieldKey) => {
            const { valid, errors, data, fieldProblems } = getProcessedState(fieldKey);

            return {
                valid: { ...acc.valid, [fieldKey]: valid },
                errors: { ...acc.errors, [fieldKey]: errors },
                data: { ...acc.data, [fieldKey]: data },
                fieldProblems: { ...acc.fieldProblems, [fieldKey]: fieldProblems }
            };
        },
        { data: {}, valid: {}, errors: {}, fieldProblems: {} }
    );

    return {
        schema,
        data: formData.data,
        valid: formData.valid,
        errors: formData.errors,
        fieldProblems: formData.fieldProblems
    };
}

export function getReducer<FormSchema extends object>(processField: ProcessFieldType) {
    return function reducer(
        state: FormState<FormSchema>,
        { type, key, value, mode, schema, defaultData, formValue, selectedSchema, fieldProblems, data }: FormAction<FormSchema>
    ) {
        const validationSchema: string[] = selectedSchema || state.schema;

        switch (type) {
            case 'setData': {
                if (!key) {
                    return state;
                }

                return { ...state, data: { ...state['data'], [key]: value } };
            }
            case 'mergeData': {
                if (!key) {
                    return state;
                }

                return { ...state, data: { ...state['data'], ...data } };
            }
            case 'setValid': {
                if (!key) {
                    return state;
                }

                return { ...state, valid: { ...state['valid'], [key]: value } };
            }
            case 'setErrors': {
                if (!key) {
                    return state;
                }

                return { ...state, errors: { ...state['errors'], [key]: value } };
            }
            case 'setFieldProblems': {
                return (
                    state?.schema?.reduce(
                        (acc, key) => ({
                            ...acc,
                            fieldProblems: { ...state['fieldProblems'], [key]: fieldProblems?.[key] ?? null },
                            valid: { ...state['valid'], [key]: state['valid']?.[key] && !fieldProblems?.[key] }
                        }),
                        state
                    ) ?? state
                );
            }
            case 'updateField': {
                if (!key || !mode) {
                    return state;
                }

                const [formattedValue, validation] = processField({ key, value, mode }, { state });
                const oldValue = state.data[key];
                const fieldProblems = { ...state.fieldProblems };
                if (oldValue !== formattedValue) {
                    fieldProblems[key] = null;
                }
                return {
                    ...state,
                    data: { ...state['data'], [key]: formattedValue },
                    errors: { ...state['errors'], [key]: validation.hasError() ? validation.getError() : null },
                    valid: { ...state['valid'], [key]: (validation.isValid && !fieldProblems[key]) || false },
                    fieldProblems
                };
            }
            case 'mergeForm': {
                // To provide a uniform result from forms even if there are multiple levels of nested forms are present
                const mergedState = {
                    ...state,
                    data: { ...state['data'], ...formValue?.['data'] },
                    errors: { ...state['errors'], ...formValue?.['errors'] },
                    valid: { ...state['valid'], ...formValue?.['valid'] },
                    fieldProblems: { ...state['fieldProblems'], ...formValue?.['fieldProblems'] }
                };
                if (mergedState['valid']) {
                    mergedState.isValid = Object.values(mergedState.valid).every(isValid => isValid);
                }
                return mergedState;
            }
            case 'setSchema': {
                if (!schema) {
                    return state;
                }

                const defaultState = init({ schema, defaultData, processField, fieldProblems });
                const removedSchemaFields = state.schema.filter(x => !schema.includes(x));
                const newSchemaFields = schema.filter(x => !state.schema.includes(x));

                // if we remove a key from the schema we also lost the latest value of the field
                // to prevent this we have to store the value in a local state so we can recover it when the key is re-added to the schema
                const local = {
                    data: omitKeys(state.data, newSchemaFields),
                    errors: omitKeys(state.errors, newSchemaFields),
                    valid: omitKeys(state.valid, newSchemaFields)
                };

                // reindex data and validation according to the new schema
                const data = addKeys(
                    omitKeys<FormSchema>(state.data, removedSchemaFields),
                    newSchemaFields,
                    null,
                    defaultState.data,
                    state.local?.data
                );
                const valid = addKeys(
                    omitKeys<FormStateValid>(state.valid, removedSchemaFields),
                    newSchemaFields,
                    false,
                    defaultState.valid,
                    state.local?.valid
                );
                const errors = addKeys(
                    omitKeys<FormStateErrors>(state.errors, removedSchemaFields),
                    newSchemaFields,
                    null,
                    defaultState.errors,
                    state.local?.errors
                );

                return { ...state, schema, data, valid, errors, local };
            }
            case 'validateForm': {
                const formValidation = validationSchema.reduce(
                    (acc, cur) => {
                        const [, validation] = processField({ key: cur, value: state.data[cur], mode: 'blur' }, { state });
                        return {
                            valid: { ...acc['valid'], [cur]: (validation.isValid && !state.fieldProblems[cur]) || false },
                            errors: { ...acc['errors'], [cur]: validation.hasError(true) ? validation.getError(true) : null }
                        };
                    },
                    { valid: state.valid, errors: state.errors }
                );

                return { ...state, valid: formValidation.valid, errors: formValidation.errors };
            }
            default:
                throw new Error('Undefined useForm action');
        }
    };
}
