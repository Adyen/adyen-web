import { UIElementProps } from '../internal/UIElement/types';

export interface RedirectConfiguration extends UIElementProps {
    type?: string;
    url?: string;
    data?: {
        [key: string]: any;
    };
    method?: 'GET' | 'POST';
    beforeRedirect?: (resolve, reject, url) => Promise<void>;
}
