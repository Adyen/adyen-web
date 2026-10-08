import { copyToClipboard } from './clipboard';

describe('copyToClipboard fallback', () => {
    let execCommandMock: jest.Mock;

    beforeEach(() => {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
        execCommandMock = jest.fn(() => true);
        Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommandMock });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Reflect.deleteProperty(navigator, 'clipboard');
        Reflect.deleteProperty(document, 'execCommand');
        document.body.innerHTML = '';
    });

    test('should log and reject when the fallback input cannot be appended', async () => {
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {
            throw new Error('append failed');
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(copyToClipboard('text')).rejects.toBeInstanceOf(TypeError);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test('should remove the fallback input after copying', async () => {
        await copyToClipboard('text');

        expect(execCommandMock).toHaveBeenCalledTimes(1);
        expect(execCommandMock).toHaveBeenCalledWith('copy');
        expect(document.body.querySelector('textarea')).toBeNull();
    });
});
