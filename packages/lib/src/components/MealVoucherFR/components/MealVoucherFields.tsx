import { h } from 'preact';
import { MealVoucherExpiryField } from './MealVoucherExpiryField';
import { GiftcardFieldsProps } from '../../Giftcard/components/types';
import { GiftcardPinField } from '../../Giftcard/components/GiftcardPinField';
import { GiftcardNumberField } from '../../Giftcard/components/GiftcardNumberField';

export const MealVoucherFields = (props: GiftcardFieldsProps) => {
    const { setRootNode } = props;
    const pinFieldProps = { ...props, label: props.i18n.get('creditCard.securityCode.label') };
    return (
        <div ref={setRootNode}>
            <GiftcardNumberField {...props} classNameModifiers={['100']} />

            <div className="adyen-checkout__field-wrapper">
                <MealVoucherExpiryField {...props} />

                <GiftcardPinField {...pinFieldProps} classNameModifiers={['50']} />
            </div>
        </div>
    );
};
