class DOMConversion {
    constructor() {}

    /**
     * This method is used for converting DOM element to JSON object
     * @param {HTMLElement} object - HTML DOM Element to convert to JSON
     * @param {object} model - Model Schema for JSON object
     */
    static toJSON(object, model) {
        const output = {}; // Initialize output object
        // iterate over the properties of the model
        for (var [key, value] of Object.entries(model)) {
            if (Operate.isObject(value)) {  // check if values is a nested object
                var props = Object.keys(value);   // Extract properties of nested object
                output[key] = {} // Create corresponding nested object in output object
                for (var i = 0; i < props.length; i++) {  //loop through properties of nested object
                    if (object[key][props[i]] && object[key][props[i]].nodeValue) { // Check if key is an attribute object
                        output[key][props[i]] = object[key][props[i]].nodeValue; // If key is an attribute object, assign node value to the corresponding output object key
                    } else if (object[key][props[i]] && !object[key][props[i]].nodeValue) {  // Check if key is not an attribute object
                        output[key][props[i]] = object[key][props[i]]; // If key is not an attribute object, assign value to the corresponding output object key
                    }
                }
            } else if (Operate.isArray(value)) {  // Check if value is an array
                output[key] = Array.from(object[key], function(childItem) { // If value is an array of HTMLElements, loop through each element and recurse
                    if (childItem instanceof HTMLElement) {
                        return this.toJSON(childItem, model);
                    }
                }.bind(this))
            } 
            
            else { 
                output[key] = object[value] || '' // if the value is neither an array or an object, assign the corresponding output[key] to the Elements' object property's value
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
        console.log(DOMElement)
        DOMElement[propertyName] = input;
    }
}