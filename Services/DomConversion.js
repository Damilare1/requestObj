class DOMConversion {
    constructor() {}

    static toJSON(object, model, isAttribute = false) {
        const output = {};
        for (var [key, value] of Object.entries(model)) {
            if (Operate.isObject(value)) {
                // Object keys list
                var props = Object.keys(value);
                output[key] = {}
                for (var i = 0; i < props.length; i++) {
                    if (object[key][props[i]] && object[key][props[i]].nodeValue) {
                        output[key][props[i]] = object[key][props[i]] && object[key][props[i]].nodeValue;
                    } else if (object[key][props[i]] && !object[key][props[i]].nodeValue) {
                        output[key][props[i]] = object[key][props[i]];
                    }
                }
            } else if (Operate.isArray(value)) {
                output[key] = Array.from(object[key], function(childItem) {
                    if (childItem instanceof HTMLElement) {
                        return this.toJSON(childItem, model);
                    }
                }.bind(this))
            } else {
                output[key] = object[value] || ''
            }
        }
        return output;

    }

    static displayDOMJSON(domJSON) {
        console.log(domJSON);
    }

    /**
     * This method is used for adding InnerHTML to DOM Elements
     * @param {HTMLElement} DOMElement - HTML DOM Element to add HTML to
     * @param {HTMLElement} propertyName - HTML element property name e.g className, href, name
     * @param {HTMLElement} input - HTML Input Element to be added into DOMElement
     */
    static addHTMLElementProperty(DOMElement, propertyName, input) {
        DOMElement[propertyName] = input;
    }
}