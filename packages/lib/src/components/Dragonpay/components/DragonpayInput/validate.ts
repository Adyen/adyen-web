import { email as emailRegex } from '../../../../utils/regex';

export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export default { isValidEmail };
