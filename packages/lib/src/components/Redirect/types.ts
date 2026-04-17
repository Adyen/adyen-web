import { UIElementProps } from '../internal/UIElement/types';

export interface RedirectConfiguration extends UIElementProps {
    type?: string;
    beforeRedirect?: (resolve, reject, url) => Promise<void>;
    /**
     * Specifies the URL to redirect to. Returned in the action object.
     * @internal
     */
    url?: string;
    /**
     * When the redirect URL must be accessed via POST, use this data to post to the redirect URL.
     * Returned in the action object
     * @internal
     */
    data?: {
        [key: string]: unknown;
    };
    /**
     * Specifies the HTTP method for the redirect.
     * Returned in the action object
     * @internal
     */
    method?: 'GET' | 'POST';
}
