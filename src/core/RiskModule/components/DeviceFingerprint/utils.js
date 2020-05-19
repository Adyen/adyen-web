import { ERRORS, ERROR_MESSAGES, DEVICE_FINGERPRINT } from '../../constants';

const handleErrorCode = errorCode => ({
    errorCode,
    message: ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERRORS.UNKNOWN],
    type: DEVICE_FINGERPRINT
});

export default handleErrorCode;
