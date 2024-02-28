import { ERROR_KEY_INVALID, ERROR_FIELD_REQUIRED } from '../core/Errors/constants';

export const getErrorMessage = (i18n, error, label?: string): string | boolean => {
    if (error?.errorMessage) {
        const errorKey = error.errorMessage;
        const shouldBuildErrorMessage = [ERROR_FIELD_REQUIRED, ERROR_KEY_INVALID].includes(errorKey);
        // Build the error msg: Enter the [label name] or Enter a valid [label name]
        const options = { values: { label: label?.toLowerCase() ?? '' } };
        return shouldBuildErrorMessage ? i18n.get(errorKey, options) : i18n.get(errorKey);
    }

    return !!error;
};
