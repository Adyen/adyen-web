import { h } from 'preact';
import { GiftcardNumberField } from './GiftcardNumberField';
import { GiftcardPinField } from './GiftcardPinField';
import { GiftcardFieldsProps } from './types';

export const GiftCardFields = (props: GiftcardFieldsProps) => {
    const { setRootNode, pinRequired } = props;
    return (
        <div ref={setRootNode} className="adyen-checkout__field-wrapper">
            <GiftcardNumberField {...props} classNameModifiers={pinRequired ? ['70'] : ['100']} />

            {pinRequired && <GiftcardPinField {...props} classNameModifiers={['30']} />}
        </div>
    );
};
