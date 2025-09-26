import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';
import { useCoreContext } from '../../../core/Context/CoreProvider';

export interface PixCodeProps {
    value: string;
}

const PixCode = ({ value }: PixCodeProps) => {
    const id = useMemo(() => getUniqueId('pix-code'), [getUniqueId]);
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__pix__code">
            <label id={id} className="adyen-checkout__pix__code__label">
                {i18n.get('pix.code.label')}
            </label>
            <span aria-labelledby={id} className="adyen-checkout__pix__code__value">
                {value}
            </span>
        </div>
    );
};

export default PixCode;
