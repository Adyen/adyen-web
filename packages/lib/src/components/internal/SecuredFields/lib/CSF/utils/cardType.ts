import { CardObject } from '../../types';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';

let shortestPermittedCardLength;

interface CardType {
    __NO_BRAND?: string;
    cards?: CardObject[];
}

const CardType: CardType = {};
CardType.__NO_BRAND = 'noBrand';

CardType.cards = [];

CardType.cards.push({
    cardType: 'mc',
    startingRules: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
    permittedLengths: [16],
    pattern: /^(5[1-5][0-9]{0,14}|2[2-7][0-9]{0,14})$/,
    securityCode: 'CVC'
});

CardType.cards.push({ cardType: 'visadankort', startingRules: [4571], permittedLengths: [16], pattern: /^(4571)[0-9]{0,12}$/ });

CardType.cards.push({
    cardType: 'visa',
    startingRules: [4],
    permittedLengths: [13, 16, 19],
    pattern: /^4[0-9]{0,18}$/,
    securityCode: 'CVV'
});

CardType.cards.push({ cardType: 'amex', startingRules: [34, 37], permittedLengths: [15], pattern: /^3[47][0-9]{0,13}$/, securityCode: 'CID' });

CardType.cards.push({ cardType: 'diners', startingRules: [36], permittedLengths: [14, 16], pattern: /^(36)[0-9]{0,12}$/ });

CardType.cards.push({ cardType: 'maestrouk', startingRules: [6759], permittedLengths: [16, 18, 19], pattern: /^(6759)[0-9]{0,15}$/ });

CardType.cards.push({ cardType: 'solo', startingRules: [6767], permittedLengths: [16, 18, 19], pattern: /^(6767)[0-9]{0,15}$/ });

CardType.cards.push({
    cardType: 'laser',
    startingRules: [6304, 6706, 677117, 677120],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(6304|6706|6709|6771)[0-9]{0,15}$/,
    cvcPolicy: 'optional'
});

CardType.cards.push({
    cardType: 'discover',
    startingRules: [6011, 644, 645, 646, 647, 648, 649, 65],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(6011[0-9]{0,12}|(644|645|646|647|648|649)[0-9]{0,13}|65[0-9]{0,14})$/
});

CardType.cards.push({
    cardType: 'jcb',
    startingRules: [3528, 3529, 353, 354, 355, 356, 357, 358],
    permittedLengths: [16, 19],
    pattern: /^(352[8,9]{1}[0-9]{0,15}|35[4-8]{1}[0-9]{0,16})$/,
    securityCode: 'CAV'
});

CardType.cards.push({
    cardType: 'bcmc',
    startingRules: [6703, 479658, 606005],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^((6703)[0-9]{0,15}|(479658|606005)[0-9]{0,13})$/,
    cvcPolicy: 'hidden'
});

CardType.cards.push({ cardType: 'bijcard', startingRules: [5100081], permittedLengths: [16], pattern: /^(5100081)[0-9]{0,9}$/ });

CardType.cards.push({ cardType: 'dankort', startingRules: [5019], permittedLengths: [16], pattern: /^(5019)[0-9]{0,12}$/ });

CardType.cards.push({ cardType: 'hipercard', startingRules: [606282], permittedLengths: [16], pattern: /^(606282)[0-9]{0,10}$/ });

// Moved above maestro (from position below uatp) to stop maestro being recognised over cup
CardType.cards.push({ cardType: 'cup', startingRules: [62, 81], permittedLengths: [14, 15, 16, 17, 18, 19], pattern: /^(62|81)[0-9]{0,17}$/ }); // orig & android v1 + modified to include our test cards (81...)

CardType.cards.push({
    cardType: 'maestro',
    startingRules: [50, 56, 57, 58, 6],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(5[0|6-8][0-9]{0,17}|6[0-9]{0,18})$/,
    cvcPolicy: 'optional'
});

CardType.cards.push({
    cardType: 'elo',
    // prettier-ignore
    startingRules: [506699, 50670, 50671, 50672, 50673, 50674, 50675, 50676, 506770, 506771, 506772, 506773, 506774, 506775, 506776, 506777, 506778, 401178, 438935, 451416, 457631, 457632, 504175, 627780, 636297, 636368],
    permittedLengths: [16],
    // prettier-ignore
    pattern:
        /^((((506699)|(506770)|(506771)|(506772)|(506773)|(506774)|(506775)|(506776)|(506777)|(506778)|(401178)|(438935)|(451416)|(457631)|(457632)|(504175)|(627780)|(636368)|(636297))[0-9]{0,10})|((50676)|(50675)|(50674)|(50673)|(50672)|(50671)|(50670))[0-9]{0,11})$/
});

CardType.cards.push({ cardType: 'uatp', startingRules: [1], permittedLengths: [15], pattern: /^1[0-9]{0,14}$/, cvcPolicy: 'optional' });

CardType.cards.push({
    cardType: 'cartebancaire',
    startingRules: [4, 5, 6],
    permittedLengths: [16],
    pattern: /^[4-6][0-9]{0,15}$/
});

CardType.cards.push({ cardType: 'visaalphabankbonus', startingRules: [450903], permittedLengths: [16], pattern: /^(450903)[0-9]{0,10}$/ });

CardType.cards.push({ cardType: 'mcalphabankbonus', startingRules: [510099], permittedLengths: [16], pattern: /^(510099)[0-9]{0,10}$/ });

CardType.cards.push({
    cardType: 'hiper',
    startingRules: [637095, 637568, 637599, 637609, 637612],
    permittedLengths: [16],
    pattern: /^(637095|637568|637599|637609|637612)[0-9]{0,10}$/
});

CardType.cards.push({ cardType: 'oasis', startingRules: [982616], permittedLengths: [16], pattern: /^(982616)[0-9]{0,10}$/, cvcPolicy: 'optional' });

CardType.cards.push({
    cardType: 'karenmillen',
    startingRules: [98261465],
    permittedLengths: [16],
    pattern: /^(98261465)[0-9]{0,8}$/,
    cvcPolicy: 'optional'
});

CardType.cards.push({
    cardType: 'warehouse',
    startingRules: [982633],
    permittedLengths: [16],
    pattern: /^(982633)[0-9]{0,10}$/,
    cvcPolicy: 'optional'
});

CardType.cards.push({ cardType: 'mir', startingRules: [220], permittedLengths: [16, 17, 18, 19], pattern: /^(220)[0-9]{0,16}$/ });

CardType.cards.push({ cardType: 'codensa', startingRules: [590712], permittedLengths: [16], pattern: /^(590712)[0-9]{0,10}$/ });

CardType.cards.push({
    cardType: 'naranja',
    startingRules: [377798, 377799, 402917, 402918, 527571, 527572, 589562],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(37|40|5[28])([279])\d*$/
});

// TODO: 589657 clashes with naranja, rest ok
CardType.cards.push({
    cardType: 'cabal',
    startingRules: [589657, 600691, 603522, 6042, 6043, 636908],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(58|6[03])([03469])\d*$/
});

CardType.cards.push({
    cardType: 'shopping',
    startingRules: [2799, 589407, 603488],
    permittedLengths: [16, 17, 18, 19],
    pattern: /^(27|58|60)([39])\d*$/
});

CardType.cards.push({ cardType: 'argencard', startingRules: [501], permittedLengths: [16, 17, 18, 19], pattern: /^(50)(1)\d*$/ }); // NOTE: starting rule changed, from 501105, to not clash with dankort. Plus it now matches its regEx!

CardType.cards.push({ cardType: 'troy', startingRules: [9792], permittedLengths: [16], pattern: /^(97)(9)\d*$/ });

// TODO: clashes with cabal
CardType.cards.push({ cardType: 'forbrugsforeningen', startingRules: [600722], permittedLengths: [16], pattern: /^(60)(0)\d*$/ });

CardType.cards.push({
    cardType: 'vpay',
    startingRules: [401, 408, 413, 434, 435, 437, 439, 441, 442, 443, 444, 446, 447, 455, 458, 460, 461, 463, 466, 471, 479, 482, 483, 487],
    permittedLengths: [13, 14, 15, 16, 17, 18, 19],
    pattern: /^(40[1,8]|413|43[4,5]|44[1,2,3,4,6,7]|45[5,8]|46[0,1,3,6]|47[1,9]|48[2,3,7])[0-9]{0,16}$/ // ^(4[0-1|3-8][0-9]{1,17})$
});

CardType.cards.push({
    cardType: 'rupay',
    startingRules: [508528],
    permittedLengths: [16],
    // prettier-ignore
    pattern:
        /^(100003|508(2|[5-9])|60(69|[7-8])|652(1[5-9]|[2-5][0-9]|8[5-9])|65300[3-4]|8172([0-1]|[3-5]|7|9)|817(3[3-8]|40[6-9]|410)|35380([0-2]|[5-6]|9))[0-9]{0,12}$/
});

CardType.cards.push({
    cardType: 'ticket',
    expiryDatePolicy: 'hidden'
});

const detectCard = (pCardNumber, pAvailableCards?) => {
    let matchedCards;
    let i;
    let len;

    if (pAvailableCards) {
        // Filter CardType.cards down to those that are found in pAvailableCards
        matchedCards = CardType.cards
            .filter(card => pAvailableCards.includes(card.cardType))
            // Further filter them to those with a regEx pattern that matches pCardNumber
            .filter(card => hasOwnProperty(card, 'pattern') && pCardNumber.match(card.pattern));

        // If we have matched cards: if there's only one - return it; else return the one with the longest startingRule
        if (matchedCards.length) {
            if (matchedCards.length === 1) {
                return matchedCards[0];
            }

            // Find longest rule for each matched card & store it as a property on the card
            for (i = 0, len = matchedCards.length; i < len; i += 1) {
                if (!matchedCards[i].longestRule) {
                    const longestRule = matchedCards[i].startingRules.reduce((a, b) => (a > b ? a : b));
                    // What we actually store is how many chars are in the rule
                    matchedCards[i].longestRule = String(longestRule).length;
                }
            }

            // Based on each matched cards longest rule - find the card with the longest one!
            return matchedCards.reduce((a, b) => (a.longestRule >= b.longestRule ? a : b));
        }

        return { cardType: CardType.__NO_BRAND };
    }

    return { cardType: CardType.__NO_BRAND };
};

const detectCardLength = (pCard, pUnformattedVal) => {
    let maxLength;
    let shortenedNewValue;
    let lengthDiff = 0;
    let reachedValidLength = false;
    let unformattedVal = pUnformattedVal;

    // Find the longest of the permitted card number lengths for this card brand
    const maxPermittedLength = pCard.cardType !== CardType.__NO_BRAND ? pCard.permittedLengths[pCard.permittedLengths.length - 1] : 0;

    // If the input value is longer than it's max permitted length then shorten it to that length
    if (maxPermittedLength && unformattedVal > maxPermittedLength) {
        lengthDiff = unformattedVal.length - maxPermittedLength;

        if (lengthDiff > 0) {
            unformattedVal = unformattedVal.substring(0, unformattedVal.length - lengthDiff);
            shortenedNewValue = unformattedVal;
        }
    }

    // If cardNumber has reached one of the cardBrand's 'permitted lengths' - mark it as 'valid'
    pCard.permittedLengths.forEach(pItem => {
        if (unformattedVal.length === pItem) {
            reachedValidLength = true;
        }
    });

    // If cardNumber is as long as the cardBrand's maximum permitted length then set the maxLength var
    if (unformattedVal.length === maxPermittedLength) {
        // Set maxlength to max + the right amount of spaces (one for every 4 digits, but not on the last block)
        const div = Math.floor(unformattedVal.length / 4);
        const mod = unformattedVal.length % 4;
        const numSpaces = mod > 0 ? div : div - 1;

        maxLength = maxPermittedLength + numSpaces;

        if (pCard.cardType.toLowerCase() === 'amex') {
            maxLength = maxPermittedLength + 2; // = 17 = 15 digits with space after 4th & 10th
        }
    }

    return {
        shortenedNewValue,
        maxLength,
        reachedValidLength
    };
};

const getShortestPermittedCardLength = () => {
    if (!shortestPermittedCardLength) {
        let permittedLengthsArray = [];

        CardType.cards.forEach(pItem => {
            permittedLengthsArray = permittedLengthsArray.concat(pItem.permittedLengths ?? []);
        });

        shortestPermittedCardLength = Math.min.apply(null, permittedLengthsArray);
    }

    return shortestPermittedCardLength;
};

const getCardByBrand = pBrand => {
    const cardType = CardType.cards.filter(card => card.cardType === pBrand);

    return cardType[0];
};

const isGenericCardType = type => {
    if (!type) throw new Error('Error: isGenericCardType: type param has not been specified');
    return type === 'card' || type === 'scheme';
};

export default {
    detectCard,
    detectCardLength,
    getShortestPermittedCardLength,
    getCardByBrand,
    isGenericCardType,
    __NO_BRAND: CardType.__NO_BRAND,
    allCards: CardType.cards
};
