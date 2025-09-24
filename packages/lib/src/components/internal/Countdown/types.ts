export interface CountdownTime {
    minutes: string | number;
    seconds: string | number;
    percentage: number;
}

export interface CountdownProps {
    minutesFromNow: number;
    onTick?: (time: CountdownTime) => void;
    onCompleted?: () => void;
}
