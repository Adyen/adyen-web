import { getSearchParameter } from './get-query-parameters';

function getComponentConfigFromUrl() {
    const config = getSearchParameter('componentConfiguration');
    if (config) return JSON.parse(config);
}

export { getComponentConfigFromUrl };
