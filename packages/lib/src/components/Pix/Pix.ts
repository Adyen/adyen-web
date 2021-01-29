import QRLoaderContainer from '../helpers/QRLoaderContainer';

class PixElement extends QRLoaderContainer {
    public static type = 'pix';

    formatProps(props) {
        return {
            delay: 2000, // ms
            countdownTime: 15, // min
            copyBtn: true,
            introduction: 'Abra o app com sua chave PIX cadastrada, escolha Pagar com Pix e escaneie o QR Code ou copie e cole o código',
            ...super.formatProps(props)
        };
    }
}

export default PixElement;
