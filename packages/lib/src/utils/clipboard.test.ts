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

    test('should log and resolve when the fallback input cannot be appended', async () => {
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {
            throw new Error('append failed');
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(copyToClipboard('text')).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test('should remove the fallback input after copying', async () => {
        await copyToClipboard('text');

        expect(execCommandMock).toHaveBeenCalledTimes(1);
        expect(execCommandMock).toHaveBeenCalledWith('copy');
        expect(document.body.querySelector('textarea')).toBeNull();
    });

    test('should warn and remove the fallback input when execCommand returns false', async () => {
        execCommandMock.mockReturnValue(false);
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await expect(copyToClipboard('text')).resolves.toBeUndefined();

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(document.body.querySelector('textarea')).toBeNull();
    });

    test('should log, remove the fallback input and resolve when execCommand throws', async () => {
        execCommandMock.mockImplementation(() => {
            throw new Error('execCommand failed');
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(copyToClipboard('text')).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(document.body.querySelector('textarea')).toBeNull();
    });
});
