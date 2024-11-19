import { IErrorEvent, ILogEvent, IInfoEvent } from './types';

export class Event<P> {
    private event: P;

    constructor(event: P) {
        this.event = event;
    }

    getEvent(): P {
        return this.event;
    }
}

export class ErrorEvent extends Event<IErrorEvent> {
    constructor(payload: IErrorEvent) {
        super(payload);
    }
}

export class LogEvent extends Event<ILogEvent> {
    constructor(payload: ILogEvent) {
        super(payload);
    }
}

export class InfoEvent extends Event<IInfoEvent> {
    constructor(payload: IInfoEvent) {
        super(payload);
    }
}
