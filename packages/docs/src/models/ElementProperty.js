class ElementProperty {
    constructor(element) {
        this.comment = element.comment;
        this.type = element.type;
        this.name = element.name;
    }

    parseDescription(description) {
        if (!description) return '-';

        return description.replace(/\r?\n|\r/, '<br />');
    }

    set comment(comment) {
        this.description = this.parseDescription(comment?.shortText);
    }
}

exports.ElementProperty = ElementProperty;
