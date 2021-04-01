const omitKeys = (obj, omit) =>
    Object.keys(obj)
        .filter(k => !omit.includes(k))
        .reduce((a, c) => {
            a[c] = obj[c];
            return a;
        }, {});

const addKeys = (obj, add, initialValue, defaultData) => add.reduce((a, c) => ({ ...a, [c]: a[c] ?? defaultData[c] ?? initialValue }), obj);

/**
 * Processes default data and sets as default in state
 */
export function init({ schema, defaultData, processField }) {
    const getProccessedState = fieldKey => {
        if (typeof defaultData[fieldKey] === 'undefined') return { valid: false, errors: null, data: null };

        const [formattedValue, validationResult] = processField(
            { field: fieldKey, value: defaultData[fieldKey], mode: 'blur' },
            { state: defaultData }
        );

        return {
            valid: validationResult.isValid ?? false,
            errors: validationResult.hasError() ? validationResult.getError() : null,
            data: formattedValue
        };
    };

    const formData = schema.reduce(
        (acc: any, fieldKey) => {
            const { valid, errors, data } = getProccessedState(fieldKey);

            return {
                valid: { ...acc.valid, [fieldKey]: valid },
                errors: { ...acc.errors, [fieldKey]: errors },
                data: { ...acc.data, [fieldKey]: data }
            };
        },
        { data: {}, valid: {}, errors: {} }
    );

    return {
        schema,
        data: formData.data,
        valid: formData.valid,
        errors: formData.errors
    };
}

export function getReducer(processField) {
    return function reducer(state, { type, key, value, mode, defaultData, schema }: any) {
        switch (type) {
            case 'setData': {
                return { ...state, data: { ...state['data'], [key]: value } };
            }
            case 'setValid': {
                return { ...state, valid: { ...state['valid'], [key]: value } };
            }
            case 'setErrors': {
                return { ...state, errors: { ...state['errors'], [key]: value } };
            }
            case 'updateField': {
                const [formattedValue, validation] = processField({ key, value, mode }, { state });

                return {
                    ...state,
                    data: { ...state['data'], [key]: formattedValue },
                    errors: { ...state['errors'], [key]: validation.hasError() ? validation.getError() : null },
                    valid: { ...state['valid'], [key]: validation.isValid ?? false }
                };
            }
            case 'setSchema': {
                const defaultState = init({ schema, defaultData, processField });
                const removedSchemaFields = state.schema.filter(x => !schema.includes(x));
                const newSchemaFields = schema.filter(x => !state.schema.includes(x));

                // reindex data and validation according to the new schema
                const data = addKeys(omitKeys(state.data, removedSchemaFields), newSchemaFields, null, defaultState.data);
                const valid = addKeys(omitKeys(state.valid, removedSchemaFields), newSchemaFields, false, defaultState.valid);
                const errors = addKeys(omitKeys(state.errors, removedSchemaFields), newSchemaFields, null, defaultState.errors);

                return { ...state, schema, data, valid, errors };
            }
            case 'validateForm': {
                const formValidation = state.schema.reduce(
                    (acc, cur) => {
                        const [, validation] = processField({ key: cur, value: state.data[cur], mode: 'blur' }, { state });
                        return {
                            valid: { ...acc['valid'], [cur]: validation.isValid ?? false },
                            errors: { ...acc['errors'], [cur]: validation.hasError() ? validation.getError() : null }
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
