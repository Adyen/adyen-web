import { h } from 'preact';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { EcontextVoucherResultProps } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const EcontextVoucherResult = (props: EcontextVoucherResultProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const { expiresAt, maskedTelephoneNumber, instructionsUrl, collectionInstitutionNumber, alternativeReference, reference } = props;

    const hasAlternativeReference = Boolean(alternativeReference);

    const voucherDetails = hasAlternativeReference
        ? [
              { label: i18n.get('voucher.collectionInstitutionNumber'), value: collectionInstitutionNumber },
              { label: i18n.get('Customer number'), value: reference },
              { label: i18n.get('Confirmation number'), value: alternativeReference },
              { label: i18n.get('voucher.expirationDate'), value: i18n.date(expiresAt) }
          ]
        : [
              { label: i18n.get('voucher.collectionInstitutionNumber'), value: collectionInstitutionNumber },
              { label: i18n.get('voucher.expirationDate'), value: i18n.dateTime(expiresAt) },
              { label: i18n.get('voucher.telephoneNumber'), value: maskedTelephoneNumber }
          ];

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction.econtext', getImage: getImage() })}
            instructionsUrl={instructionsUrl}
            paymentReferenceLabel={hasAlternativeReference ? i18n.get('Payment information') : undefined}
            voucherDetails={voucherDetails}
            copyBtn={!hasAlternativeReference}
            showReferenceValue={!hasAlternativeReference}
        />
    );
};

export default EcontextVoucherResult;
