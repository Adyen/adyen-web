import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { EcontextVoucherResultProps } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const EcontextVoucherResult = (props: EcontextVoucherResultProps) => {
    const { expiresAt, maskedTelephoneNumber, instructionsUrl, collectionInstitutionNumber } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction.econtext', getImage: getImage() })}
            instructionsUrl={instructionsUrl}
            voucherDetails={[
                { label: i18n.get('voucher.collectionInstitutionNumber'), value: collectionInstitutionNumber },
                { label: i18n.get('voucher.expirationDate'), value: i18n.dateTime(expiresAt) },
                { label: i18n.get('voucher.telephoneNumber'), value: maskedTelephoneNumber }
            ]}
            copyBtn
        />
    );
};

export default EcontextVoucherResult;
