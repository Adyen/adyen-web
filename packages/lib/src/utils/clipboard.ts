function createInput(text): HTMLInputElement {
    const textArea = document.createElement('textArea');
    (textArea as HTMLInputElement).readOnly = true;
    (textArea as HTMLInputElement).value = text;
    document.body.appendChild(textArea);
    return textArea as HTMLInputElement;
}

export async function copyToClipboard(value) {
    if (navigator?.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch (err) {
            // swallow it, continue to fallback
        }
    }

    let copyInput: HTMLInputElement;
    try {
        copyInput = createInput(value);
        copyInput.select();
        const successful = document.execCommand('copy');
        if (!successful) {
            console.warn('Fallback: Copy command was unsuccessful');
        }
    } catch (err) {
        console.error('Fallback: Unable to copy', err);
    } finally {
        document.body.removeChild(copyInput);
    }
}

export default copyToClipboard;
