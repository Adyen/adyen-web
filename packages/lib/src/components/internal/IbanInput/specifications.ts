/**
 * @internal
 * IBAN Countries, length, structure and examples
 */
const countries: Record<string, { length: number; structure: string; example: string }> = {
    AD: {
        length: 24,
        structure: 'F04F04A12',
        example: 'AD9912345678901234567890'
    },
    AL: {
        length: 28,
        structure: 'F08A16',
        example: 'AL47212110090000000235698741'
    },
    AT: {
        length: 20,
        structure: 'F05F11',
        example: 'AT611904300234573201'
    },
    BE: {
        length: 16,
        structure: 'F03F07F02',
        example: 'BE68 5390 0754 7034'
    },
    BG: {
        length: 22,
        structure: 'U04F04F02A08',
        example: 'BG80BNBG96611020345678'
    },
    CH: {
        length: 21,
        structure: 'F05A12',
        example: 'CH9300762011623852957'
    },
    CY: {
        length: 28,
        structure: 'F03F05A16',
        example: 'CY17002001280000001200527600'
    },
    CZ: {
        length: 24,
        structure: 'F04F06F10',
        example: 'CZ6508000000192000145399'
    },
    DE: {
        length: 22,
        structure: 'F08F10',
        example: 'DE00123456789012345678'
    },
    DK: {
        length: 18,
        structure: 'F04F09F01',
        example: 'DK5000400440116243'
    },
    EE: {
        length: 20,
        structure: 'F02F02F11F01',
        example: 'EE382200221020145685'
    },
    ES: {
        length: 24,
        structure: 'F04F04F01F01F10',
        example: 'ES9121000418450200051332'
    },
    FI: {
        length: 18,
        structure: 'F06F07F01',
        example: 'FI2112345600000785'
    },
    FR: {
        length: 27,
        structure: 'F05F05A11F02',
        example: 'FR1420041010050500013M02606'
    },
    GB: {
        length: 22,
        structure: 'U04F06F08',
        example: 'GB29NWBK60161331926819'
    },
    GI: {
        length: 23,
        structure: 'U04A15',
        example: 'GI75NWBK000000007099453'
    },
    GR: {
        length: 27,
        structure: 'F03F04A16',
        example: 'GR1601101250000000012300695'
    },
    HR: {
        length: 21,
        structure: 'F07F10',
        example: 'HR1210010051863000160'
    },
    HU: {
        length: 28,
        structure: 'F03F04F01F15F01',
        example: 'HU42117730161111101800000000'
    },
    IE: {
        length: 22,
        structure: 'U04F06F08',
        example: 'IE29AIBK93115212345678'
    },
    IS: {
        length: 26,
        structure: 'F04F02F06F10',
        example: 'IS140159260076545510730339'
    },
    IT: {
        length: 27,
        structure: 'U01F05F05A12',
        example: 'IT60X0542811101000000123456'
    },
    LI: {
        length: 21,
        structure: 'F05A12',
        example: 'LI21088100002324013AA'
    },
    LT: {
        length: 20,
        structure: 'F05F11',
        example: 'LT121000011101001000'
    },
    LU: {
        length: 20,
        structure: 'F03A13',
        example: 'LU280019400644750000'
    },
    LV: {
        length: 21,
        structure: 'U04A13',
        example: 'LV80BANK0000435195001'
    },
    MC: {
        length: 27,
        structure: 'F05F05A11F02',
        example: 'MC5811222000010123456789030'
    },
    MD: {
        length: 24,
        structure: 'U02A18',
        example: 'MD24AG000225100013104168'
    },
    ME: {
        length: 22,
        structure: 'F03F13F02',
        example: 'ME25505000012345678951'
    },
    MK: {
        length: 19,
        structure: 'F03A10F02',
        example: 'MK07250120000058984'
    },
    MT: {
        length: 31,
        structure: 'U04F05A18',
        example: 'MT84MALT011000012345MTLCAST001S'
    },
    NL: {
        length: 18,
        structure: 'U04F10',
        example: 'NL99BANK0123456789'
    },
    NO: {
        length: 15,
        structure: 'F04F06F01',
        example: 'NO9386011117947'
    },
    PL: {
        length: 28,
        structure: 'F08F16',
        example: 'PL00123456780912345678901234'
    },
    PT: {
        length: 25,
        structure: 'F04F04F11F02',
        example: 'PT50000201231234567890154'
    },
    RO: {
        length: 24,
        structure: 'U04A16',
        example: 'RO49AAAA1B31007593840000'
    },
    RS: {
        length: 22,
        structure: 'F03F13F02',
        example: 'RS35260005601001611379'
    },
    SE: {
        length: 24,
        structure: 'F03F16F01',
        example: 'SE4550000000058398257466'
    },
    SI: {
        length: 19,
        structure: 'F05F08F02',
        example: 'SI56263300012039086'
    },
    SK: {
        length: 24,
        structure: 'F04F06F10',
        example: 'SK3112000000198742637541'
    },
    SM: {
        length: 27,
        structure: 'U01F05F05A12',
        example: 'SM86U0322509800000000270100'
    },
    VA: {
        length: 22,
        structure: 'F03F15',
        example: 'VA59001123000012345678'
    }
};

export default countries;
