import { ERROR_FIELD_INVALID, ERROR_FIELD_REQUIRED } from '../core/Errors/constants';
import Language from '../language';

export const getErrorMessage = (i18n: Language, error, label?: string, lowerCaseLabel = true): string | boolean => {
    if (error?.errorMessage) {
        const errorKey = error.errorMessage;
        const shouldBuildErrorMessage = [ERROR_FIELD_REQUIRED, ERROR_FIELD_INVALID].includes(errorKey) && !!label;

        // Build the error msg: Enter the [label name] or Enter a valid [label name]
        if (shouldBuildErrorMessage) {
            const options = { values: { label: lowerCaseLabel ? label.toLowerCase() : label } };
            return i18n.get(errorKey, options);
        }

        return i18n.get(errorKey);
    }

    return !!error;
};
