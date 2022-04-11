/**
 * @internal
 * IBAN Countries, length, structure and examples
 */
const countries = {
    AD: {
        length: 24,
        structure: 'F04F04A12',
        example: 'AD9912345678901234567890'
    },
    AE: {
        length: 23,
        structure: 'F03F16',
        example: 'AE993331234567890123456'
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
    AZ: {
        length: 28,
        structure: 'U04A20',
        example: 'AZ21NABZ00000000137010001944'
    },
    BA: {
        length: 20,
        structure: 'F03F03F08F02',
        example: 'BA391290079401028494'
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
    BH: {
        length: 22,
        structure: 'U04A14',
        example: 'BH67BMAG00001299123456'
    },
    BR: {
        length: 29,
        structure: 'F08F05F10U01A01',
        example: 'BR9700360305000010009795493P1'
    },
    CH: {
        length: 21,
        structure: 'F05A12',
        example: 'CH9300762011623852957'
    },
    CR: {
        length: 22,
        structure: 'F04F14',
        example: 'CR72012300000171549015'
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
    DO: {
        length: 28,
        structure: 'U04F20',
        example: 'DO28BAGR00000001212453611324'
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
    FO: {
        length: 18,
        structure: 'F04F09F01',
        example: 'FO6264600001631634'
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
    GE: {
        length: 22,
        structure: 'U02F16',
        example: 'GE29NB0000000101904917'
    },
    GI: {
        length: 23,
        structure: 'U04A15',
        example: 'GI75NWBK000000007099453'
    },
    GL: {
        length: 18,
        structure: 'F04F09F01',
        example: 'GL8964710001000206'
    },
    GR: {
        length: 27,
        structure: 'F03F04A16',
        example: 'GR1601101250000000012300695'
    },
    GT: {
        length: 28,
        structure: 'A04A20',
        example: 'GT82TRAJ01020000001210029690'
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
    IL: {
        length: 23,
        structure: 'F03F03F13',
        example: 'IL620108000000099999999'
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
    KW: {
        length: 30,
        structure: 'U04A22',
        example: 'KW81CBKU0000000000001234560101'
    },
    KZ: {
        length: 20,
        structure: 'F03A13',
        example: 'KZ86125KZT5004100100'
    },
    LB: {
        length: 28,
        structure: 'F04A20',
        example: 'LB62099900000001001901229114'
    },
    LC: {
        length: 32,
        structure: 'U04F24',
        example: 'LC07HEMM000100010012001200013015'
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
    MR: {
        length: 27,
        structure: 'F05F05F11F02',
        example: 'MR1300020001010000123456753'
    },
    MT: {
        length: 31,
        structure: 'U04F05A18',
        example: 'MT84MALT011000012345MTLCAST001S'
    },
    MU: {
        length: 30,
        structure: 'U04F02F02F12F03U03',
        example: 'MU17BOMM0101101030300200000MUR'
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
    PK: {
        length: 24,
        structure: 'U04A16',
        example: 'PK36SCBL0000001123456702'
    },
    PL: {
        length: 28,
        structure: 'F08F16',
        example: 'PL00123456780912345678901234'
    },
    PS: {
        length: 29,
        structure: 'U04A21',
        example: 'PS92PALS000000000400123456702'
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
    SA: {
        length: 24,
        structure: 'F02A18',
        example: 'SA0380000000608010167519'
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
    ST: {
        length: 25,
        structure: 'F08F11F02',
        example: 'ST68000100010051845310112'
    },
    TL: {
        length: 23,
        structure: 'F03F14F02',
        example: 'TL380080012345678910157'
    },
    TN: {
        length: 24,
        structure: 'F02F03F13F02',
        example: 'TN5910006035183598478831'
    },
    TR: {
        length: 26,
        structure: 'F05F01A16',
        example: 'TR330006100519786457841326'
    },
    VG: {
        length: 24,
        structure: 'U04F16',
        example: 'VG96VPVG0000012345678901'
    },
    XK: {
        length: 20,
        structure: 'F04F10F02',
        example: 'XK051212012345678906'
    },
    AO: {
        length: 25,
        structure: 'F21',
        example: 'AO69123456789012345678901'
    },
    BF: {
        length: 27,
        structure: 'F23',
        example: 'BF2312345678901234567890123'
    },
    BI: {
        length: 16,
        structure: 'F12',
        example: 'BI41123456789012'
    },
    BJ: {
        length: 28,
        structure: 'F24',
        example: 'BJ39123456789012345678901234'
    },
    CI: {
        length: 28,
        structure: 'U01F23',
        example: 'CI17A12345678901234567890123'
    },
    CM: {
        length: 27,
        structure: 'F23',
        example: 'CM9012345678901234567890123'
    },
    CV: {
        length: 25,
        structure: 'F21',
        example: 'CV30123456789012345678901'
    },
    DZ: {
        length: 24,
        structure: 'F20',
        example: 'DZ8612345678901234567890'
    },
    IR: {
        length: 26,
        structure: 'F22',
        example: 'IR861234568790123456789012'
    },
    JO: {
        length: 30,
        structure: 'A04F22',
        example: 'JO15AAAA1234567890123456789012'
    },
    MG: {
        length: 27,
        structure: 'F23',
        example: 'MG1812345678901234567890123'
    },
    ML: {
        length: 28,
        structure: 'U01F23',
        example: 'ML15A12345678901234567890123'
    },
    MZ: {
        length: 25,
        structure: 'F21',
        example: 'MZ25123456789012345678901'
    },
    QA: {
        length: 29,
        structure: 'U04A21',
        example: 'QA30AAAA123456789012345678901'
    },
    SN: {
        length: 28,
        structure: 'U01F23',
        example: 'SN52A12345678901234567890123'
    },
    UA: {
        length: 29,
        structure: 'F25',
        example: 'UA511234567890123456789012345'
    }
};

export default countries;
