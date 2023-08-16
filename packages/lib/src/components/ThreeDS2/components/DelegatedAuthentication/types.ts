import { ChallengeResolveData, DelegatedAuthenticationResolveData } from '../utils';
import { PaymentAmount } from '../../../../types';
import UIElement from '../../../UIElement';

export enum DelegatedAuthenticationError {
    Unknown = 0,
    NoPlatformAuthenticator = 1,
    WebauthnNotSupported = 2,
    SPCNotSupported = 3,
    NoInputDataPresent = 4,
    TimeoutReached = 5,
    Canceled = 6,
    NoBrowserCookie = 7
}

export interface DelegatedAuthenticationEnrollmentProps {
    token: string;
    dataKey: string;
    authorisationToken: string;
    useOriginalFlow: boolean;
    onComplete?: (data: ChallengeResolveData) => void;
}

export interface DelegatedAuthenticationProps {
    token: string;
    paymentData: string;
    onComplete?: (data: DelegatedAuthenticationResolveData) => void;
    onError?: (message: string) => void;
    useOriginalFlow?: boolean;
    clientKey?: string;
    loadingContext?: string;
    elementRef?: UIElement;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
}

type PublicKeyCredentialUserEntityModified = Omit<PublicKeyCredentialUserEntity, 'id'> & {
    id: string;
};

type PublicKeyCredentialParametersModified = Omit<PublicKeyCredentialParameters, 'alg'> & {
    alg: { value: COSEAlgorithmIdentifier };
};

type PublicKeyCredentialCreationOptionsModifiedFields = {
    challenge: { value: string };
    pubKeyCredParams: PublicKeyCredentialParametersModified[];
    user: PublicKeyCredentialUserEntityModified;
};

type PublicKeyCredentialCreationOptionsImpl = Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'pubKeyCredParams' | 'user'> &
    PublicKeyCredentialCreationOptionsModifiedFields;

export interface DelegatedAuthenticationEnrollmentInputData {
    publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsImpl;
    instrument: PaymentInstrument;
}

type PublicKeyCredentialDescriptorModified = Omit<PublicKeyCredentialDescriptor, 'id'> & {
    id: string;
};

type PublicKeyCredentialRequestOptionsModifiedFields = {
    challenge: { value: string };
    allowCredentials: PublicKeyCredentialDescriptorModified[];
};

type PublicKeyCredentialRequestOptionsImpl = Omit<PublicKeyCredentialRequestOptions, 'challenge' | 'allowCredentials'> &
    PublicKeyCredentialRequestOptionsModifiedFields;

export interface DelegatedAuthenticationInputData {
    publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsImpl;
    amount: PaymentAmount;
    instrument: PaymentInstrument;
    payeeOrigin: string;
    merchantName: string;
    formattedAmount: string;
    currencyExponent: number;
}

interface BaseOutputData {
    credential?: DelegatedAuthenticationCredential | DelegatedAuthenticationEnrollmentCredential;
    errorDescription?: string;
    errorCode?: number;
}

export interface DelegatedAuthenticationOutputData extends BaseOutputData {
    credential?: DelegatedAuthenticationCredential;
    deleteCredential?: boolean;
}

export interface DelegatedAuthenticationEnrollmentOutputData extends BaseOutputData {
    credential?: DelegatedAuthenticationEnrollmentCredential;
}

export interface DelegatedAuthenticationCredential extends Credential {
    response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
    };
    clientExtensionResults: any;
}

export interface DelegatedAuthenticationEnrollmentCredential extends Credential {
    response: {
        attestationObject: string;
        clientDataJSON: string;
    };
    clientExtensionResults: any;
}

export interface PaymentInstrument {
    displayName: string;
    icon: string;
}
