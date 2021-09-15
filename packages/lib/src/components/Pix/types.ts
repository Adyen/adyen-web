export interface PixInputDataState {
    firstName?: string;
    lastName?: string;
    socialSecurityNumber?: string;
}

export interface PixInputValidState {
    firstName?: boolean;
    lastName?: boolean;
    socialSecurityNumber?: boolean;
}

export interface PixInputErrorState {
    firstName?: boolean;
    lastName?: boolean;
    socialSecurityNumber?: boolean;
}
