class SFKeyboardEvent extends KeyboardEvent {
    public target: any;

    constructor(type: string, eventInitDict: KeyboardEventInit, name: string) {
        super(type, eventInitDict);
        try {
            this.target = { name };
        } catch (e) {
            // try...catch needed for unit tests
        }
    }
}

export default SFKeyboardEvent;
