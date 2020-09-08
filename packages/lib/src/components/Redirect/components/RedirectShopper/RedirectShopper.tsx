import { Component, h } from 'preact';

interface RedirectShopperProps {
    beforeRedirect: (resolve, reject, url) => Promise<any>;
    url: string;
    method: 'GET' | 'POST';
    data?: any;
}

class RedirectShopper extends Component<RedirectShopperProps> {
    public static defaultProps = {
        beforeRedirect: resolve => resolve(),
        method: 'GET',
        data: {}
    };

    private postForm;

    componentDidMount() {
        const doRedirect = () => {
            if (this.postForm) {
                this.postForm.submit();
            } else {
                window.location.assign(this.props.url);
            }
        };

        const dispatchEvent = new Promise((resolve, reject) => this.props.beforeRedirect(resolve, reject, this.props.url));
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
