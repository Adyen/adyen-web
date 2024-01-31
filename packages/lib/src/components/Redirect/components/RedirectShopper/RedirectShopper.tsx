import { Component, h } from 'preact';
import detectInIframeInSameOrigin from '../../../../utils/detectInIframeInSameOrigin';

interface RedirectShopperProps {
    beforeRedirect: (resolve, reject, url) => Promise<void>;
    url: string;
    method: 'GET' | 'POST';
    data?: any;
    redirectFromTopWhenInIframe?: boolean;
}

class RedirectShopper extends Component<RedirectShopperProps> {
    private postForm;
    public static defaultProps = {
        beforeRedirect: resolve => resolve(),
        method: 'GET'
    };

    componentDidMount() {
        const doRedirect = () => {
            if (this.postForm) {
                this.postForm.submit();
            } else {
                if (this.props.redirectFromTopWhenInIframe && detectInIframeInSameOrigin()) {
                    // if in an iframe and the config prop allows it - try to redirect from the top level window
                    window.top.location.assign?.(this.props.url);
                } else {
                    window.location.assign(this.props.url);
                }
            }
        };

        const dispatchEvent = new Promise((resolve, reject) =>
            this.props.beforeRedirect(resolve, reject, {
                url: this.props.url,
                method: this.props.method,
                ...(this.props.data ? { data: this.props.data } : {})
            })
        );

        dispatchEvent.then(doRedirect).catch(() => {});
    }

    render({ url, method, data = {} }) {
        if (method === 'POST') {
            return (
                <form
                    method="post"
                    action={url}
                    style={{ display: 'none' }}
                    ref={ref => {
                        this.postForm = ref;
                    }}
                    {...(this.props.redirectFromTopWhenInIframe && detectInIframeInSameOrigin() && { target: '_top' })}
                >
                    {Object.keys(data).map(key => (
                        <input type="hidden" name={key} key={key} value={data[key]} />
                    ))}
                </form>
            );
        }

        return null;
    }
}

export default RedirectShopper;
