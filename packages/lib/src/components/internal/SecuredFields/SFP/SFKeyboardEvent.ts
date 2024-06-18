class SFKeyboardEvent extends KeyboardEvent {
    public target: any;

    constructor(type: string, eventInitDict: KeyboardEventInit, name: string) {
        super(type, eventInitDict);
        this.target = { name };
    }
}

export default SFKeyboardEvent;
