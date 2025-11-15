import { h } from 'preact';
import { QRImageProps } from '../types';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

export const QRImage = ({ onLoad, src }: QRImageProps) => {
    const { i18n } = useCoreContext();

    return <img src={src} alt={i18n.get('wechatpay.scanqrcode')} onLoad={onLoad} />;
};
