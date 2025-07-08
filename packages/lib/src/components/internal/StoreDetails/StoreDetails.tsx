import { useState, useEffect } from 'preact/hooks';
import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Checkbox from '../FormFields/Checkbox';
import cx from 'classnames';

import './StoreDetails.scss';

interface StoreDetailsProps {
    storeDetails?: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * "Store details" generic checkbox
 */
function StoreDetails({ storeDetails = false, disabled = false, className = '', ...props }: StoreDetailsProps) {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState(storeDetails);

    const onChange = e => {
        setValue(e.target.checked);
    };

    useEffect(() => {
        props.onChange(value);
    }, [value]);

    return (
        <div className={cx('adyen-checkout__store-details', className)}>
            <Checkbox onChange={onChange} disabled={disabled} label={i18n.get('storeDetails')} name={'storeDetails'} />
        </div>
    );
}

export default StoreDetails;
