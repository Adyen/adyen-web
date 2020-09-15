export default function createIframe(src, title = 'iframe element', styleStr = 'border: none; height:100%; width:100%;') {
    const iframeEl = document.createElement('iframe');
    iframeEl.setAttribute('src', src);
    iframeEl.setAttribute('class', 'js-iframe');
    iframeEl.setAttribute('title', title);
    iframeEl.setAttribute('frameborder', '0'); // deprecated but still necessary for IE TODO re-test this on next round of IE testing
    iframeEl.setAttribute('scrolling', 'no');
    iframeEl.setAttribute('allowtransparency', 'true');
    iframeEl.setAttribute('style', styleStr);
    iframeEl.setAttribute('referrerpolicy', 'origin'); // Necessary for ClientKey to work
    //    iframeEl.setAttribute('allow', 'accelerometer, gyroscope');// Stops the "The devicemotion events are blocked by feature policy" warning in Chrome >=66

    const noIframeElContent = document.createTextNode('<p>Your browser does not support iframes.</p>');
    iframeEl.appendChild(noIframeElContent);

    return iframeEl;
}
