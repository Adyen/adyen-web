import { useState, useEffect } from 'preact/hooks';
import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Checkbox from '../FormFields/Checkbox';

import './StoreDetails.scss';

interface StoreDetailsProps {
    storeDetails?: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

/**
 * "Store details" generic checkbox
 */
function StoreDetails({ storeDetails = false, disabled = false, ...props }: StoreDetailsProps) {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState(storeDetails);

    const onChange = e => {
        setValue(e.target.checked);
    };

    useEffect(() => {
        props.onChange(value);
    }, [value]);

    return (
        <div className="adyen-checkout__store-details">
            <Checkbox onChange={onChange} disabled={disabled} label={i18n.get('storeDetails')} name={'storeDetails'} />
        </div>
    );
}

export default StoreDetails;
