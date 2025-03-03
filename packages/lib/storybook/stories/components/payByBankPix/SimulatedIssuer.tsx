import { h } from 'preact';
import { useState } from 'preact/hooks';
import { mockRedirectUrlIssuerPage } from './mocks';

const SimulatedIssuer = () => {
    const [url, setUrl] = useState(mockRedirectUrlIssuerPage);
    const handleRedirect = () => {
        window.location.href = url;
    };

    const handleTextareaChange = (event: any) => {
        setUrl(event.target.value);
    };

    return (
        <>
            <h1>Simulated issuer&#39;s page for enrollment, click the button to redirect back to the hosted page</h1>
            <textarea value={url} onChange={handleTextareaChange} rows={4} cols={50} />
            <br />
            <button onClick={handleRedirect}>Redirect Back</button>
        </>
    );
};

export default SimulatedIssuer;
