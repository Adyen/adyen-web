import { h } from 'preact';
import { EMIFundingSource } from './types';
import CardElement from '../Card';
import UPIElement from '../UPI';
import { useState } from 'preact/hooks';
import { SegmentedControl } from '../internal/SegmentedControl';

interface EMIComponentProps {
    defaultActiveFundingSource: EMIFundingSource;
    fundingSourceUIElements: Record<EMIFundingSource, CardElement | UPIElement>;
    onSetActiveFundingSource: (fundingSource: EMIFundingSource) => void;
}

export const EMIComponent = ({ defaultActiveFundingSource, fundingSourceUIElements, onSetActiveFundingSource }: Readonly<EMIComponentProps>) => {
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
        </div>
    );
};
