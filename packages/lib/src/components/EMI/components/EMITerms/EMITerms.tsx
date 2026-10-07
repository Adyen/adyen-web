import { h } from 'preact';
import Link from '../../../internal/Link';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import styles from './EMITerms.module.scss';

interface EMITermsProps {
    /** `EmiIssuer.termLink`, the bank's terms page. Absent until the backend returns it. */
    termLink?: string;
    /** The processing-fee sentence, as the lookup worded it. Rendered verbatim: the backend owns this copy. */
    processingMessage?: string;
}

export function EMITerms({ termLink, processingMessage }: Readonly<EMITermsProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    // The URL comes from a network response and ends up in an `href`, so only `https` is linked
    const termsUrl = isValidHttpUrl(termLink) ? termLink : undefined;
    const termsLink = i18n.get('emi.termsLink');

    return (
        <p className={styles.terms}>
            {processingMessage && `${processingMessage}. `}
            {`${i18n.get('emi.terms')} `}
            {termsUrl ? <Link to={termsUrl}>{termsLink}</Link> : termsLink}
        </p>
    );
}
