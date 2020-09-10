type EventItem = (conversionId: string) => Promise<any>;

class EventsQueue {
    public events: EventItem[] = [];

    add(event) {
        this.events.push(event);
    }

    run(conversionId?: string) {
        const promises = this.events.map(e => e(conversionId));
        this.events = [];

        return Promise.all(promises);
    }
}

export default EventsQueue;
