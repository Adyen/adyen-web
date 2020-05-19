import withQRLoader from '../helpers/withQRLoader';
import * as config from './config';

export default withQRLoader({
    type: 'wechatpayQR',
    ...config
});
