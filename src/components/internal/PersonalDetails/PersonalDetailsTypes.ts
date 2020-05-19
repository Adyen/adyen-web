export interface PersonalDetailsStructure {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    telephoneNumber?: string;
    shopperEmail?: string;
}

export interface PersonalDetailsProps {
    label?: string;
    namePrefix?: string;
    requiredFields?: string[];
    visibility?: string;
    data: PersonalDetailsStructure;
    onChange: Function;
    readonly?: boolean;
    ref?: any;
}

export interface ReadOnlyPersonalDetailsProps {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
}
