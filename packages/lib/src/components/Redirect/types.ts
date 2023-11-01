import { UIElementProps } from '../internal/UIElement/types';

export interface RedirectConfiguration extends UIElementProps {
    type?: string;
    url?: string;
    method?: 'GET' | 'POST';
    beforeRedirect?: (resolve, reject, url) => Promise<void>;
}
