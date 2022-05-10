// import { BaseInnerFormProps } from '../../../utils/useForm/types';
//
// export interface PhoneInputProps extends BaseInnerFormProps<PhoneInputSchema> {
//     items: Array<{
//         id: string;
//         name: string;
//     }>;
//     showInlineErrors?: boolean;
// }

export interface PhoneInputSchema {
    phoneNumber?: string;
    phonePrefix?: string;
}
