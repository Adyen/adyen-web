import { h } from 'preact';
import Link from '../../../internal/Link';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { ISSUER_TERMS_URLS } from '../../constants';
import styles from './EMITerms.module.scss';

interface EMITermsProps {
    /** `EmiIssuer.issuerCode`, which keys the bank's terms page. */
    issuerCode: string;
    /** The processing-fee sentence, as the lookup worded it. Rendered verbatim: the backend owns this copy. */
    processingMessage?: string;
}

export function EMITerms({ issuerCode, processingMessage }: Readonly<EMITermsProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const termsUrl = ISSUER_TERMS_URLS[issuerCode];
    const termsLink = i18n.get('emi.termsLink');

    return (
        <p className={styles.terms}>
            {processingMessage && `${processingMessage.replace('299', '₹299.00')}. `}
            {`${i18n.get('emi.terms')} `}
            {termsUrl ? <Link to={termsUrl}>{termsLink}</Link> : termsLink}
        </p>
    );
}
