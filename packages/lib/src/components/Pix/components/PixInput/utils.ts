import { formatCPFCNPJ } from '../../../internal/SocialSecurityNumberBrazil/utils';

export const pixFormatters = {
    socialSecurityNumber: ssn => formatCPFCNPJ(ssn)
};
