type EventItem = (checkoutAttemptId: string) => Promise<any>;

class EventsQueue {
    public events: EventItem[] = [];

    add(event) {
        this.events.push(event);
    }

    run(checkoutAttemptId?: string) {
        const promises = this.events.map(e => e(checkoutAttemptId));
        this.events = [];

        return Promise.all(promises);
    }
}

export default EventsQueue;
