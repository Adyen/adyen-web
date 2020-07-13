import { FALLBACK_CONTEXT } from '../core/config';
import useCoreContext from '../core/Context/useCoreContext';

export default (name: string, { loadingContext = FALLBACK_CONTEXT }: { loadingContext: string }) => {
    const { i18n } = useCoreContext();

    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'text/plain'
        }
    };

    const url = `${loadingContext}datasets/${name}/${i18n.locale}.json`;

    return fetch(url, options)
        .then(response => {
            if (response.ok) return response.json();

            return console.warn(`Dataset ${name} is not available`);
        })
        .catch(error => {
            console.error(error);
        });
};
