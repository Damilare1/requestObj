
class DOMConversion {
    constructor() { }
  
    static toJSON(object, model, isAttribute = false) {
      const output = {};
      for (const [key, value] of Object.entries(model)) {
        if (Operate.isObject(value)) {
          if (key === "attributes") {
            output[key] = this.toJSON(object, value, true)
          } else {
            output[key] = this.toJSON(object, value)
          }
        } else if (Operate.isArray(value) && key === "children") {
          output[key] = Array.from(object[key], function (childItem) {
            return this.toJSON(childItem, model);
          }.bind(this))
        }
        else {
          if (isAttribute) {
            output[key] = object.getAttribute(value) || ''
          } else {
            output[key] = object[value] || ''
          }
        }
      }
      return output;
  
    }
  
    static displayDOMJSON = (domJSON) => {
      console.log(domJSON);
    };
  }
