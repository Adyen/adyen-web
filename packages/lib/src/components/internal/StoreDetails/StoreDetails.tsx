import { useState, useEffect } from 'preact/hooks';
import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import Checkbox from '../FormFields/Checkbox';

/**
 * "Store details" generic checkbox
 */
function StoreDetails({ storeDetails = false, ...props }) {
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
            <Checkbox onChange={onChange} label={i18n.get('storeDetails')} name={'storeDetails'} />
        </div>
    );
}

export default StoreDetails;
