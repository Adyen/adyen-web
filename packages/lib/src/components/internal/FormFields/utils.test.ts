import { convertFullToHalf } from './utils';

describe('convertFullToHalf util', () => {
    test('convert full width characters to half width characters while not changing the half width characters', () => {
        expect(convertFullToHalf('test123')).toBe('test123');
        expect(convertFullToHalf('ｔｅｓｔ１２３')).toBe('test123');
        expect(convertFullToHalf('ｔｅｓｔ＠email１２３.com')).toBe('test@email123.com');
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
