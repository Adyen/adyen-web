import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';

export interface PixCodeProps {
    value: string;
}

const PixCode = ({ value }: PixCodeProps) => {
    const id = useMemo(() => getUniqueId('pix-code'), [getUniqueId]);

    return (
        <div className="adyen-checkout__pix__code">
            <label htmlFor={id} className="adyen-checkout__pix__code__label">
                Pix code
            </label>
            <span id={id} className="adyen-checkout__pix__code__value">
                {value}
            </span>
        </div>
    );
};

export default PixCode;
