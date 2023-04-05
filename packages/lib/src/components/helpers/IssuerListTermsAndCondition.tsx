import { interpolateElement } from '../../language/utils';
import { h } from 'preact';

export const getIssuerListTermsAndConditions = ({ i18n }, translationKey, url) =>
    interpolateElement(i18n.get(translationKey), [
        translation => (
            <a href={url} target="_blank" rel="noopener noreferrer">
                {translation}
            </a>
        )
    ]);
