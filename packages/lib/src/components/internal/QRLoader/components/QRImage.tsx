import { h } from 'preact';
import { QRImageProps } from '../types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

const QRImage = ({ onLoad, src }: QRImageProps) => {
    const { i18n } = useCoreContext();

    return <img src={src} alt={i18n.get('wechatpay.scanqrcode')} onLoad={onLoad} />;
};

export default QRImage;
