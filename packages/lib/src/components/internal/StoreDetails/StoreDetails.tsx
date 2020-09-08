import { useState, useEffect } from 'preact/hooks';
import { h } from 'preact';
import { renderFormField } from '../FormFields';
import useCoreContext from '../../../core/Context/useCoreContext';

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
            {renderFormField('boolean', {
                onChange,
                label: i18n.get('storeDetails'),
                value,
                name: 'storeDetails'
            })}
        </div>
    );
}

export default StoreDetails;
