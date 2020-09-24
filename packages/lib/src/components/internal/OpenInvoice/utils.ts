const getInitialActiveFieldsets = (fieldsets, visibility) =>
    fieldsets.reduce((acc, fieldset) => {
        acc[fieldset] = visibility[fieldset] !== 'hidden';
        return acc;
    }, {});

export { getInitialActiveFieldsets };
