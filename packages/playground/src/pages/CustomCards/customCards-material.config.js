export const materialStyles = {
    base: {
        fontFamily: 'Roboto, sans-serif',
        padding: '8px 8px 8px 10px'
    }
};

const setMaterialClass = (pNode, setOrRemove, classToSet) => {
    if (setOrRemove) {
        if (pNode.className.indexOf(classToSet) === -1) {
            pNode.className += ` ${classToSet}`;
        }
        return;
    }

    // Remove focus
    if (pNode.className.indexOf(classToSet > -1)) {
        const newClassName = pNode.className.replace(classToSet, '');
        pNode.className = newClassName.trim();
    }
};

export const materialFocus = focusObject => {
    const sfNode = focusObject.rootNode.querySelector(`[data-cse="${focusObject.fieldType}"]`);
    const label = sfNode.previousElementSibling;
    setMaterialClass(sfNode, focusObject.focus, 'pm-input-field-mat--focus');
    setMaterialClass(label, focusObject.focus, 'material-input-label--focus');
};

export const handleMaterialError = errorObject => {
    const sfNode = errorObject.rootNode && errorObject.rootNode.querySelector(`[data-cse="${errorObject.fieldType}"]`);
    if (!sfNode) return;

    const label = sfNode.previousElementSibling;

    if (errorObject.error.length > 0) {
        setMaterialClass(sfNode, true, 'pm-input-field-mat--error');
        setMaterialClass(label, true, 'material-input-label--error');
    } else {
        setMaterialClass(sfNode, false, 'pm-input-field-mat--error');
        setMaterialClass(label, false, 'material-input-label--error');
    }
};

export const onMaterialFieldValid = validObject => {
    const sfNode = validObject.rootNode.querySelector(`[data-cse="${validObject.fieldType}"]`);
    const label = sfNode.previousElementSibling;

    if (validObject.valid) {
        setMaterialClass(sfNode, true, 'pm-input-field-mat--valid');
        setMaterialClass(label, true, 'material-input-label--valid');
    } else {
        setMaterialClass(sfNode, false, 'pm-input-field-mat--valid');
        setMaterialClass(label, false, 'material-input-label--valid');
    }
};
