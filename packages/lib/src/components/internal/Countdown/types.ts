export interface CountdownProps {
    minutesFromNow: number;
    onTick?: (time) => void;
    onCompleted?: () => void;
}

export interface CountdownTime {
    minutes: string | number;
    seconds: string | number;
}
