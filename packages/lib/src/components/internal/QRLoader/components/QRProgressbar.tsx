import { h } from 'preact';

export const QRProgressbar = ({ percentage }: { readonly percentage: number }) => {
    return (
        <div className="adyen-checkout__qr-loader__progress">
            <span className="adyen-checkout__qr-loader__percentage" style={{ width: `${percentage}%` }} />
        </div>
    );
};
