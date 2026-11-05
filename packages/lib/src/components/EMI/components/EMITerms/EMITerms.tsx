import { h } from 'preact';
import Link from '../../../internal/Link';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import styles from './EMITerms.module.scss';

interface EMITermsProps {
    termLink?: string;
    processingMessage?: string;
}

export function EMITerms({ termLink, processingMessage }: Readonly<EMITermsProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
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
