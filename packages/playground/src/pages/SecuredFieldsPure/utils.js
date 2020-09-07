import { paymentsURL } from './config';

const setErrorClasses = (pNode, pSetErrors) => {
    if (pSetErrors) {
        if (pNode.className.indexOf('pm-input-field--error') === -1) {
            pNode.className += ' pm-input-field--error';
        }
        return;
    }

    let newClassName;

    // Remove errors
    if (pNode.className.indexOf('pm-input-field--error') > -1) {
        newClassName = pNode.className.replace('pm-input-field--error', '');
        pNode.className = newClassName.trim();
    }
};

const setFocusClasses = (pNode, pSetFocus) => {
    if (pSetFocus) {
        if (pNode.className.indexOf('pm-input-field--focus') === -1) {
            pNode.className += ' pm-input-field--focus';
        }
        return;
    }

    let newClassName;

    // Remove focus
    if (pNode.className.indexOf('pm-input-field--focus') > -1) {
        newClassName = pNode.className.replace('pm-input-field--focus', '');
        pNode.className = newClassName.trim();
    }
};

export const setCCErrors = pCallbackObj => {
    const holderDiv = pCallbackObj.rootNode.querySelector('[data-cse="' + pCallbackObj.fieldType + '"]');
    const errorNode = holderDiv.parentNode.querySelector('.pm-form-label__error-text');

    if (errorNode && pCallbackObj.error !== '') {
        errorNode.style.display = 'block';
        errorNode.innerText = pCallbackObj.error;

        // Add error classes
        setErrorClasses(holderDiv, true);
    } else if (errorNode && pCallbackObj.error === '') {
        errorNode.style.display = 'none';
        errorNode.innerText = '';

        // Remove error classes
        setErrorClasses(holderDiv, false);
    }
};

export const setFocus = pCallbackObj => {
    const holderDiv = pCallbackObj.rootNode.querySelector('[data-cse="' + pCallbackObj.fieldType + '"]');

    setFocusClasses(holderDiv, pCallbackObj.focus);
};

export const submitPaymentRequest = (requestObj, typeStr) => {
    const options = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        credentials: 'same-origin',
        headers: {
            Accept: 'text/html; charset=utf-8',
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(requestObj)
    };

    return fetch(paymentsURL, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            return console.warn(`Service at ${paymentsURL} is not available`);
        })
        .then(data => {
            window.console.log('@@@ index::/payments success:: data=', data);

            let resultTxt,
                htmlStr,
                resultType,
                reason = '';

            if (data) {
                if (data.resultCode) {
                    reason = data.refusalReason ? `("${data.refusalReason}")` : '';

                    resultTxt = `${data.resultCode} ${reason}  --pspRef: ${data.pspReference}`;
                    resultType = 'Result';
                }

                if (data.errorCode) {
                    resultTxt = data.errorType + ' error. Message: ' + data.message;
                    resultType = 'Error';
                }

                htmlStr = `<div><h4>${typeStr}</h4><b>${resultType}: </b> ${resultTxt}</div>`;
                window.rootNode.innerHTML = htmlStr;
                window.rootNode.style.opacity = 1;

                const payBtn = window.rootNode.nextElementSibling;
                if (!payBtn || payBtn.getAttribute('type') !== 'button') {
                    return;
                }

                payBtn.style.display = 'none';
            }
        })
        .catch(e => {
            console.warn(`Call to ${paymentsURL} failed. Error= ${e}`);
        });
};

export const createRequestUI = () => {
    window.rootNode.style.opacity = 0.3;
    window.rootNode.style['pointer-events'] = 'none';

    const payBtn = window.rootNode.nextElementSibling;
    if (!payBtn || payBtn.getAttribute('type') !== 'button') {
        return;
    }

    const htmlStr = `
        <div class="adyen-checkout__spinner__wrapper adyen-checkout__spinner__wrapper--inline">
            <div class="adyen-checkout__spinner adyen-checkout__spinner--medium" style="border: 3px solid #FFF;border-top-color: transparent;"/>
        </div>
    `;

    payBtn.innerHTML = htmlStr;
    payBtn.style.opacity = 0.3;
    payBtn.style['pointer-events'] = 'none';
    payBtn.style.height = '58px';
    payBtn.style.padding = 0;
};
