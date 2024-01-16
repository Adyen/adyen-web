import WeChat from './WeChat';
import * as utils from '../../utils/getTimeDiffInMinutesFromNow';
import { countdownTime } from './config';

const calculateTimeDiffMock = jest.spyOn(utils, 'getTimeDiffInMinutesFromNow').mockImplementation(() => 5);

describe('WeChat', () => {
    describe('formatProps', () => {
        test('should calculate the time difference if expiresAt exists', () => {
            const expiresAt = '2024-01-15T14:00:48.321283089Z';
            const wechat = new WeChat({ expiresAt });
            expect(calculateTimeDiffMock).toHaveBeenCalledWith(expiresAt, wechat.props.delay);
        });
        test('should use the countdownTime from the props if it exists', () => {
            const wechat = new WeChat({ countdownTime: 3 });
            expect(wechat.props.countdownTime).toBe(3);
        });
        test('should use the default countdownTime if neither expiresAt nor countdownTime value exists', () => {
            const wechat = new WeChat({});
            expect(wechat.props.countdownTime).toBe(countdownTime);
        });
    });

    describe('isValid', () => {
        test('should be always true', () => {
            const wechat = new WeChat({});
            expect(wechat.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const wechat = new WeChat({});
            expect(wechat.data.paymentMethod.type).toBe('wechatpayQR');
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const wechat = new WeChat({});
            expect(wechat.render()).toBe(null);
        });
    });
});
