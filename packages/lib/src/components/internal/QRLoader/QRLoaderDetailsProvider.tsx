import { h, createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { CountdownTime } from '../Countdown/types';

interface QRLoaderDetailsProviderProps {
    type: string;
    qrCodeImage: string;
    qrCodeData: string;
    countdownTime: number;
    percentage: number;
    timeToPay: string;
    instructions?: string | (() => h.JSX.Element);
    copyBtn: boolean;
    onTick: (time: CountdownTime) => void;
    onQRCodeLoad: () => void;
    onTimeUp: () => void;
    handleCopy?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
    children: ComponentChildren;
}

type QRLoaderDetailsContextValue = Omit<QRLoaderDetailsProviderProps, 'children'>;

const QRLoaderDetailsContext = createContext<QRLoaderDetailsContextValue | undefined>(undefined);

const QRLoaderDetailsProvider = ({ children, ...props }: QRLoaderDetailsProviderProps) => {
    return <QRLoaderDetailsContext.Provider value={{ ...props }}>{children}</QRLoaderDetailsContext.Provider>;
};

const useQRLoaderDetails = (): QRLoaderDetailsContextValue => {
    const context = useContext(QRLoaderDetailsContext);

    if (context === undefined) {
        throw new Error('"useQRLoaderDetails" must be used within a QRLoaderDetailsContext');
    }

    return context;
};

export { QRLoaderDetailsProvider, useQRLoaderDetails };
