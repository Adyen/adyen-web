import { h } from 'preact';
import { EMIFundingSource } from './types';
import CardElement from '../Card';
import UPIElement from '../UPI';
import { useState } from 'preact/hooks';
import { SegmentedControl } from '../internal/SegmentedControl';

import type { PayButtonFunctionProps } from '../internal/UIElement/types';
import { useCoreContext } from '../../core/Context/CoreProvider';
import useImage from '../../core/Context/useImage';
import { PREFIX } from '../internal/Icon/constants';

interface EMIComponentProps {
    defaultActiveFundingSource: EMIFundingSource;
    fundingSourceUIElements: Record<EMIFundingSource, CardElement | UPIElement>;
    onSetActiveFundingSource: (fundingSource: EMIFundingSource) => void;
    showPayButton: boolean;
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
}

export const EMIComponent = ({
    defaultActiveFundingSource,
    fundingSourceUIElements,
    onSetActiveFundingSource,
    showPayButton,
    payButton
}: Readonly<EMIComponentProps>) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const [activeFundingSource, setActiveFundingSource] = useState<EMIFundingSource>(defaultActiveFundingSource);

    const handleFundingSourceChange = (fundingSource: EMIFundingSource) => {
        setActiveFundingSource(fundingSource);
        onSetActiveFundingSource(fundingSource);
    };

    return (
        <div>
            <SegmentedControl
                onChange={source => handleFundingSourceChange(source)}
                selectedValue={activeFundingSource}
                options={[
                    {
                        label: 'Card',
                        value: EMIFundingSource.CARD,
                        id: `${EMIFundingSource.CARD}-id`,
                        controls: `${EMIFundingSource.CARD}-control`
                    },
                    {
                        label: 'UPI',
                        value: EMIFundingSource.UPI,
                        id: `${EMIFundingSource.UPI}-id`,
                        controls: `${EMIFundingSource.UPI}-control`
                    }
                ]}
            />
            <div
                style={{
                    marginTop: 16
                }}
            >
                {fundingSourceUIElements[activeFundingSource].render()}
            </div>
            {showPayButton &&
                payButton({
                    label: activeFundingSource === EMIFundingSource.UPI ? i18n.get('generateQRCode') : undefined,
                    icon:
                        activeFundingSource === EMIFundingSource.UPI
                            ? getImage({ imageFolder: 'components/' })('qr')
                            : getImage({ imageFolder: 'components/' })(`${PREFIX}lock`)
                })}
        </div>
    );
};
