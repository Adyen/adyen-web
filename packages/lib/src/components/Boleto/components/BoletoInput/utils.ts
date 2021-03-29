import { formatCPFCNPJ } from '../SocialSecurityNumberBrazil/utils';

export const boletoFormatters = {
    socialSecurityNumber: ssn => formatCPFCNPJ(ssn)
};
