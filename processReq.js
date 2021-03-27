/**
 * The RequestObj object.
 * @typedef {Object} RequestObj
 * @property {string} [reqName] - requset name.
 * @property {string} [index] - requset index.
 * @property {Object} objectModel -namespace.
 * @property {string} method - request method available on name space.
 * @property {Array.<String>} arguments - arguments to be passed into the method.
 * @property {RequestObj} [andThen] - nested request object which isn't a callback.
 * @property {string} [callBack] - call back for single requests.
 */

/**
 * The flow Request Object
 * @typedef {Object} FlowRequest
 * @property {Array.<RequestObj>} flowRequest - Array of requests
 */

/**
 * The RequestObj object.
 * @typedef {Object} HTMLJSONEntityModel4Html
 * @property {string} tagName - Element tag name.
 * @property {Object} attributes -Element attributes.
 * @property {string} attributes.class - Element class.
 * @property {string} attributes.style - Element style.
 * @property {string} [attributes.src] - Element src attribute.
 * @property {Array.<Object>} [children] - Nested elements.
 */

/**
 * @type RequestObj
 */
var getElement = {
  reqName: "getElement", //CommanName
  objectModel: document,
  method: "getElementById",
  arguments: ["test"],
};

/**
 * @type {HTMLJSONEntityModel4Html}
 */
var entityModel4Html = {
  tagName: "tagName",
  attributes: { class: "classList", style: "style", src: "src" },
  children: ["all"],
};

class DOMConversion {
  constructor() { }

  static toJSON(object, model) {
    const output = {};
    for (const [key, value] of Object.entries(model)) {
      if (Operate.isObject(value)) {
        output[key] = this.toJSON(object, value)
      } else if (Operate.isArray(value) && key === "children") {
        output[key] = Array.from(object[key], function (childItem) {
          return this.toJSON(childItem, model);
        }.bind(this))
      }
      else {
        output[key] = object[value] || ''
      }
    }
    return output;

  }

  static displayDOMJSON = (domJSON) => {
    console.log(domJSON);
  };
}

class Storage {
  constructor() { }
  static saveToLocalStorage = (name, value) => {
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.log("local storage unavailable");
    }
  };
  static getFromLocalStorage = (name) => {
    try {
      return JSON.parse(window.localStorage.getItem(name));
    } catch (e) {
      console.log("Error in retrieving Info", e);
    }
  };
}

class Operate {
  static isArray(value) {
    return (
      value &&
      Array.isArray(value) &&
      typeof value === "object" &&
      value.constructor === Array
    );
  }

  static isObject(value) { return value && typeof value === 'object' && value.constructor === Object; }

  static isIn(argA, argB) {
    return argB.indexOf(argA) > -1 ? true : false;
  }
  static isPromise(obj) {
    return typeof obj === "object" && "then" in obj;
  }
  static isFlowRequest(obj) {
    return "flowRequest" in obj;
  }
  static handlePromise(process) {
    if (this.isPromise(process)) {
      process
        .then(function (res) {
          return res;
        })
        .catch(function (err) {
          return err;
        });
    } else {
      return new Promise(function (resolve, _) {
        resolve(process);
      });
    }
  }
}
class ActionSpaceEditor {
  constructor() {
    this._flowResultState = {};
  }

  /**
   * processes single request
   * @param {RequestObj} reqObj - request object
   * @param {unknown} [resultObj=null] - Optional parameter for passing result of previous requests
   * @returns {Promise}
   */
  processReq(reqObj, resultObj = null) {
    var method = reqObj.objectModel[reqObj.method];
    var objArgs = reqObj.arguments.map(function (argItem) {
      if (argItem === "fromPrevious") return resultObj;
      return argItem
    });
    var processResult = method.apply(reqObj.objectModel, objArgs);
    if (reqObj.callBack) {
      var callBack = window[reqObj.callBack];
      if (callBack) {
        processResult = this.processReq(callBack, processResult);
      }
    }
    return processResult;
  }

  /**
   * This method is used for parallel requests
   * @param {FlowRequest} reqObj - request object containing array of objects
   */
  processReqArray(reqObj) {
    const state = this._flowResultState;
    if (Operate.isFlowRequest(reqObj) && Operate.isArray(reqObj.flowRequest)) {
      var flowRequest = reqObj.flowRequest;
      flowRequest.forEach(function (request) {
        var requestArgs = request.arguments.map(function (reqArg) {
          if (state[reqArg]) return state[reqArg];
          return reqArg;
        })
        var updatedRequest = { ...request, arguments: requestArgs };
        const result = this.processReq(updatedRequest);
        if (result) {
          state[request.reqName] = result;
        }
      }.bind(this))
    }
    console.log(state)
    return null;
  }
  /**
   * This method is used for nested requests
   * @param {RequestObj} reqObj - request object containing nested requests
   */
  processReqNestedObject(reqObj) {
    /**
     * This method is used for recursion and ensuring the requests are performed sequentially
     * @param {RequestObj} request - Current request object
     */
    function recursiveThen(request) {
      var requestArgs = request.arguments.map(function (reqArg) {
        if (this._flowResultState[reqArg]) return this._flowResultState[reqArg];
        return reqArg;
      }.bind(this));
      var updatedRequest = { ...request, arguments: requestArgs };
      const result = this.processReq(updatedRequest);
      if (result) {
        this._flowResultState[request.reqName] = result;
      }
      if (request.andThen) {
        recursiveThen.call(this, request.andThen);
      }
    }
    recursiveThen.call(this, reqObj);
  }
}

/**
 * @type RequestObj
 */
var singleReq = {
  reqName: "singleReq",
  objectModel: document,
  method: "getElementById",
  arguments: ["test"],
  callBack: "convertToJSON",
};

/**
 * @type RequestObj
 */
var convertToJSON = {
  objectModel: DOMConversion,
  method: "toJSON",
  arguments: ["fromPrevious", entityModel4Html],
};

/**
 * @type RequestObj
 */
var displayJSON = {
  objectModel: DOMConversion,
  method: "displayDOMJSON",
  arguments: ["fromPrevious"],
};

/**
 * @type {FlowRequest}
 */
var actionFlowModelReq = {
  flowRequest: [
    {
      reqName: "convertElementToJSON",
      objectModel: document,
      method: "getElementById",
      arguments: ["test"],
      callBack: "convertToJSON",
    },
    {
      reqName: "saveElementToLocalStorage",
      objectModel: Storage,
      method: "saveToLocalStorage",
      arguments: ["domJSON", "convertElementToJSON"],
    },
    {
      reqName: "displaySavedElement",
      objectModel: Storage,
      method: "getFromLocalStorage",
      arguments: ["domJSON"],
      callBack: "displayJSON"
    },
  ],
};

/**
 * @type {RequestObj}
 */
var nestedFlowModelReq = {
  reqName: "convertElementToJSON",
  objectModel: document,
  method: "getElementById",
  arguments: ["test"],
  callBack: "convertToJSON",
  andThen: {
    reqName: "saveElementToLocalStorage",
    objectModel: Storage,
    method: "saveToLocalStorage",
    arguments: ["domJSON", "convertElementToJSON"],
    andThen: {
      reqName: "displaySavedElement",
      objectModel: Storage,
      method: "getFromLocalStorage",
      arguments: ["domJSON"],
      callBack: "displayJSON"
    },
  },
};

var engine = new ActionSpaceEditor();
// var DOMJson = engine.processReq(singleReq);
// console.log(DOMJson)

// engine.processReqArray(actionFlowModelReq)

engine.processReqNestedObject(nestedFlowModelReq)