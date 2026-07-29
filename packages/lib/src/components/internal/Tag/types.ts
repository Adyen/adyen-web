export enum TagVariant {
    SUCCESS = 'success',
    INFO = 'info'
}

export interface TagProps {
    label: string;
    variant?: TagVariant;
}
