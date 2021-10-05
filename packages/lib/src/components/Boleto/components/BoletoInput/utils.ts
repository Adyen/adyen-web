import { formatCPFCNPJ } from '../../../internal/SocialSecurityNumberBrazil/utils';

export const boletoFormatters = {
    socialSecurityNumber: ssn => formatCPFCNPJ(ssn)
};
