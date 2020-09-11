export const validatePhoneNumber = (phoneNumber, minLength = 3) => !!phoneNumber && phoneNumber.length >= minLength;

export default { validatePhoneNumber };
