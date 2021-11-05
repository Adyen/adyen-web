export default function createIframe({ src, title = 'iframe element', policy = 'origin', styleStr = 'border: none; height:100%; width:100%;' }) {
    const iframeEl = document.createElement('iframe');
    iframeEl.setAttribute('src', src);
    iframeEl.setAttribute('class', 'js-iframe');
    if (title !== '' && title.trim().length !== 0) {
        iframeEl.setAttribute('title', title);
    } else {
        iframeEl.setAttribute('role', 'presentation');
    }
    iframeEl.setAttribute('frameborder', '0'); // deprecated but still necessary for IE TODO re-test this on next round of IE testing
    iframeEl.setAttribute('scrolling', 'no');
    iframeEl.setAttribute('allowtransparency', 'true');
    iframeEl.setAttribute('style', styleStr);
    iframeEl.setAttribute('referrerpolicy', policy); // Necessary for ClientKey to work
    // Commenting out stops the "The devicemotion events are blocked by feature policy" warning in Chrome >=66 that some merchant experienced
    // Commenting in stops the same warnings in development (??)
    if (process.env.NODE_ENV === 'development') {
        iframeEl.setAttribute('allow', 'accelerometer; gyroscope');
    }

    const noIframeElContent = document.createTextNode('<p>Your browser does not support iframes.</p>');
    iframeEl.appendChild(noIframeElContent);

    return iframeEl;
}
