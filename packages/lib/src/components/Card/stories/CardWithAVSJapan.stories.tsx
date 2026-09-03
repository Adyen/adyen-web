import { h } from 'preact';
import { http, HttpResponse } from 'msw';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { CardConfiguration } from '../types';
import { createCardComponent } from './cardStoryHelpers/createCardComponent';

type CardStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Components/Cards'
};

/**
 * Mocks the `datasets/states/JP/:locale.json` endpoint so the AVS Prefecture dropdown can be
 * demoed before the dataset files are hosted by checkoutshopper.
 * The data below mirrors what will be served in production (47 JP prefectures).
 */
const JP_PREFECTURES_EN_US = [
    { id: '23', name: 'Aichi' },
    { id: '05', name: 'Akita' },
    { id: '02', name: 'Aomori' },
    { id: '12', name: 'Chiba' },
    { id: '38', name: 'Ehime' },
    { id: '18', name: 'Fukui' },
    { id: '40', name: 'Fukuoka' },
    { id: '07', name: 'Fukushima' },
    { id: '21', name: 'Gifu' },
    { id: '10', name: 'Gunma' },
    { id: '34', name: 'Hiroshima' },
    { id: '01', name: 'Hokkaido' },
    { id: '28', name: 'Hyogo' },
    { id: '08', name: 'Ibaraki' },
    { id: '17', name: 'Ishikawa' },
    { id: '03', name: 'Iwate' },
    { id: '37', name: 'Kagawa' },
    { id: '46', name: 'Kagoshima' },
    { id: '14', name: 'Kanagawa' },
    { id: '39', name: 'Kochi' },
    { id: '43', name: 'Kumamoto' },
    { id: '26', name: 'Kyoto' },
    { id: '24', name: 'Mie' },
    { id: '04', name: 'Miyagi' },
    { id: '45', name: 'Miyazaki' },
    { id: '20', name: 'Nagano' },
    { id: '42', name: 'Nagasaki' },
    { id: '29', name: 'Nara' },
    { id: '15', name: 'Niigata' },
    { id: '44', name: 'Oita' },
    { id: '33', name: 'Okayama' },
    { id: '47', name: 'Okinawa' },
    { id: '27', name: 'Osaka' },
    { id: '41', name: 'Saga' },
    { id: '11', name: 'Saitama' },
    { id: '25', name: 'Shiga' },
    { id: '32', name: 'Shimane' },
    { id: '22', name: 'Shizuoka' },
    { id: '09', name: 'Tochigi' },
    { id: '36', name: 'Tokushima' },
    { id: '13', name: 'Tokyo' },
    { id: '31', name: 'Tottori' },
    { id: '16', name: 'Toyama' },
    { id: '30', name: 'Wakayama' },
    { id: '06', name: 'Yamagata' },
    { id: '35', name: 'Yamaguchi' },
    { id: '19', name: 'Yamanashi' }
];

const JP_PREFECTURES_JA_JP = [
    { id: '23', name: '愛知県' },
    { id: '05', name: '秋田県' },
    { id: '02', name: '青森県' },
    { id: '12', name: '千葉県' },
    { id: '38', name: '愛媛県' },
    { id: '18', name: '福井県' },
    { id: '40', name: '福岡県' },
    { id: '07', name: '福島県' },
    { id: '21', name: '岐阜県' },
    { id: '10', name: '群馬県' },
    { id: '34', name: '広島県' },
    { id: '01', name: '北海道' },
    { id: '28', name: '兵庫県' },
    { id: '08', name: '茨城県' },
    { id: '17', name: '石川県' },
    { id: '03', name: '岩手県' },
    { id: '37', name: '香川県' },
    { id: '46', name: '鹿児島県' },
    { id: '14', name: '神奈川県' },
    { id: '39', name: '高知県' },
    { id: '43', name: '熊本県' },
    { id: '26', name: '京都府' },
    { id: '24', name: '三重県' },
    { id: '04', name: '宮城県' },
    { id: '45', name: '宮崎県' },
    { id: '20', name: '長野県' },
    { id: '42', name: '長崎県' },
    { id: '29', name: '奈良県' },
    { id: '15', name: '新潟県' },
    { id: '44', name: '大分県' },
    { id: '33', name: '岡山県' },
    { id: '47', name: '沖縄県' },
    { id: '27', name: '大阪府' },
    { id: '41', name: '佐賀県' },
    { id: '11', name: '埼玉県' },
    { id: '25', name: '滋賀県' },
    { id: '32', name: '島根県' },
    { id: '22', name: '静岡県' },
    { id: '09', name: '栃木県' },
    { id: '36', name: '徳島県' },
    { id: '13', name: '東京都' },
    { id: '31', name: '鳥取県' },
    { id: '16', name: '富山県' },
    { id: '30', name: '和歌山県' },
    { id: '06', name: '山形県' },
    { id: '35', name: '山口県' },
    { id: '19', name: '山梨県' }
];

const createJPPrefecturesMockHandlers = () => [
    // Catches both test/live environments and any shopper locale, falling back to the English
    // names when a JP prefecture dataset isn't available yet for the requested locale.
    http.get(/\/datasets\/states\/JP\/(?<locale>[^/]+)\.json$/, ({ params }) => {
        const locale = params.locale as string;
        return HttpResponse.json(locale === 'ja-JP' ? JP_PREFECTURES_JA_JP : JP_PREFECTURES_EN_US);
    })
];

export const WithAVSJapan: CardStory = {
    render: createCardComponent,
    args: {
        countryCode: 'JP',
        shopperLocale: 'ja-JP',
        srConfig: { moveFocus: true, showPanel: true },
        componentConfiguration: {
            _disableClickToPay: true,
            billingAddressRequired: true,
            billingAddressAllowedCountries: ['JP'],
            data: {
                billingAddress: {
                    country: 'JP',
                    stateOrProvince: '13',
                    postalCode: '107-0052',
                    city: 'Minato-ku',
                    street: 'Akasaka 1-Chome',
                    houseNumberOrName: '1-1'
                }
            }
        }
    },
    parameters: {
        msw: {
            handlers: createJPPrefecturesMockHandlers()
        }
    }
};

export default meta;
