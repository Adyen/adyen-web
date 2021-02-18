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
    const formData = schema.reduce(
        (acc: any, fieldKey) => {
            if (typeof defaultData[fieldKey] !== 'undefined') {
                const [formattedValue, validationResult] = processField(fieldKey, defaultData[fieldKey], 'blur');
                return {
                    valid: { ...acc.valid, [fieldKey]: validationResult.isValid ?? false },
                    errors: { ...acc.errors, [fieldKey]: validationResult.hasError() ? validationResult.getError() : null },
                    data: { ...acc.data, [fieldKey]: formattedValue }
                };
            }

            // If no default value is set, set field to the default initial values
            return {
                valid: { ...acc.valid, [fieldKey]: false },
                errors: { ...acc.errors, [fieldKey]: null },
                data: { ...acc.data, [fieldKey]: null }
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

export function reducer(state, { type, key, value, processField, defaultData, schema }: any) {
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
                    const [, validation] = processField(cur, state.data[cur], 'blur');
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
}
