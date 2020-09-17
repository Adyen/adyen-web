import { convertFullToHalf } from './utils';

describe('convertFullToHalf util', () => {
    test('convert full width characters to half width characters', () => {
        expect(convertFullToHalf('ｔｅｓｔ１２３＠ｅｍａｉｌ．com')).toBe('test123@email.com');
    });

    test('does not convert other characters', () => {
        const katakana = 'パブロ';
        const hiragana = '平仮名';
        const kanji = '漢字';
        const hangul = '훈민정음';

        expect(convertFullToHalf(katakana)).toBe(katakana);
        expect(convertFullToHalf(hiragana)).toBe(hiragana);
        expect(convertFullToHalf(kanji)).toBe(kanji);
        expect(convertFullToHalf(hangul)).toBe(hangul);
    });
});
