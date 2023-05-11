import { digitsOnlyFormatter } from './formatters';

function getAllCharactersArray() {
    const allCharacters: Array<string> = [];
    for (let i = 32; i < 127; i++) {
        allCharacters.push(String.fromCharCode(i));
    }
    return allCharacters.join(',');
}

describe('Formatters', () => {
    describe('digitsOnlyFormatter', () => {
        test('All non-digit characters get removed from value', () => {
            const testString = getAllCharactersArray();
            const charactersLeftOver = digitsOnlyFormatter(testString);
            expect(charactersLeftOver).toBe('0123456789');
        });
    });
});
