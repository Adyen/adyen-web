import { h } from 'preact';
import { MonizzePinExpiryDate } from './MonizzePinExpiryDate';
import { GiftcardFieldsProps } from '../../Giftcard/components/types';
import { GiftcardNumberField } from '../../Giftcard/components/GiftcardNumberField';

export const MonizzeFields = (props: GiftcardFieldsProps) => {
    const { setRootNode } = props;
    return (
        <div ref={setRootNode} className="adyen-checkout__field-wrapper">
            <GiftcardNumberField {...props} classNameModifiers={['70']} />

            <MonizzePinExpiryDate {...props} classNameModifiers={['30']} />
        </div>
    );
};
