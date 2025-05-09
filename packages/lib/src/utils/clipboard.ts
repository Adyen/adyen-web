export function copyToClipboard(value) {
    function createInput(text): HTMLInputElement {
        const textArea = document.createElement('textArea');
        (textArea as HTMLInputElement).readOnly = true;
        (textArea as HTMLInputElement).value = text;
        document.body.appendChild(textArea);
        return textArea as HTMLInputElement;
    }

    const copyInput = createInput(value);
    
    copyInput.select();

    document.execCommand('copy');

    document.body.removeChild(copyInput);
}

export default copyToClipboard;
