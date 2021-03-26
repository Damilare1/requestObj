/**
 * The RequestObj object.
 * @typedef {Object} RequestObj
 * @property {string} [reqName] - requset name.
 * @property {string} [index] - requset index.
 * @property {Object} objectModel -namespace.
 * @property {string} method - request method available on name space.
 * @property {number} arguments - arguments to be passed into the method.
 * @property {string} [andThen] - call back for parallel requests.
 * @property {Object} callBackObjectModel - Object model where callback can be found.
 * @property {string} [callBack] - call back for single requests.
 * @property {RequestObj} [requestObj] - call back for single requests.
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
  attributes: { class: "class.value", style: "style.value", src: "" },
  children: ["all"],
};

class DOMConversion {
  constructor() {}
  static toJSON = (domElement) => {
    return {
      tagName: domElement.tagName,
      attributes: {
        class: [...domElement.classList],
        style: [...domElement.style],
        src: domElement.src || "",
      },
      children: Array.from(domElement.children),
    };
  };
  static displayDOMJSON = (domJSON) => {
    console.log(domJSON);
  };
}

class Storage {
  constructor() {}
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
  constructor() {}

  /**
   * processes single request
   * @param {RequestObj} reqObj - request object
   * @param {Object} [resultObj=null] - Optional parameter for passing result of previous requests
   * @returns {Promise}
   */
  static processReq(reqObj, resultObj = null) {
    var method = reqObj.objectModel[reqObj.method];
    var objArgs = reqObj.arguments.slice();
    if (resultObj) {
      var resultObjKeys = Object.keys(resultObj);
      objArgs.forEach(function (arg, index) {
        if (Operate.isIn(arg, resultObjKeys)) {
          objArgs[index] = resultObj[arg];
        }
      });
      console.log(objArgs);
    }
    var process = method.apply(reqObj.objectModel, objArgs);
    if (process) {
      return Operate.handlePromise(process)
        .then(function (result) {
          if (result) {
            var callBack =
              reqObj.callBackObjectModel &&
              reqObj.callBackObjectModel[reqObj.callBack]
                ? reqObj.callBackObjectModel[reqObj.callBack]
                : null;
            if (callBack) {
              return Operate.handlePromise(
                callBack.apply(callBack.callBackObjectModel, [result])
              )
                .then(function (result) {
                  return result;
                })
                .catch(function (err) {
                  return err;
                });
            }
          } else {
            return null;
          }
        })
        .catch(function (e) {
          console.log(e);
          return null;
        });
    }
    return new Promise(function (resolve, _) {
      resolve(null);
    });
  }
  /**
   * This method is used for parallel requests
   * @param {FlowRequest} reqObj - request object containing array of objects
   */
  static processReqArray(reqObj) {
    if (Operate.isFlowRequest(reqObj) && Operate.isArray(reqObj.flowRequest)) {
      var flowRequest = reqObj.flowRequest;
      var resultObj = {};

      /**
       * This method is used for recursion and ensuring the requests are performed sequentially
       * @param {number} index - Index of current request
       */
      function recursiveThen(index) {
        const request = flowRequest[index];
        this.processReq(request, resultObj).then(
          function (result) {
            resultObj[request.reqName] = result;
            index++;
            if (index < flowRequest.length) recursiveThen.call(this, index);
          }.bind(ActionSpaceEditor)
        );
      }
      recursiveThen.call(this, 0);
    }
    return null;
  }
  /**
   * This method is used for nested requests
   * @param {RequestObj} reqObj - request object containing nested requests
   */
  static processReqNestedObject(reqObj) {
    var resultObj = {};
    /**
     * This method is used for recursion and ensuring the requests are performed sequentially
     * @param {RequestObj} obj - Current request object
     */
    function recursiveThen(obj) {
      this.processReq(obj, resultObj).then(
        function (result) {
          resultObj[obj.reqName] = result;
          if (obj.requestObj) {
            recursiveThen.call(this, obj.requestObj);
          }
        }.bind(ActionSpaceEditor)
      );
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
  callBackObjectModel: DOMConversion,
  callBack: ["toJSON"],
};

/**
 * @type RequestObj
 */
var convertToJSON = {
  objectModel: DOMConversion,
  method: "toJSON",
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
      callBackObjectModel: DOMConversion,
      callBack: ["toJSON"],
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
      callBackObjectModel: DOMConversion,
      callBack: ["displayDOMJSON"],
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
  callBackObjectModel: DOMConversion,
  callBack: ["toJSON"],
  requestObj: {
    reqName: "saveElementToLocalStorage",
    objectModel: Storage,
    method: "saveToLocalStorage",
    arguments: ["domJSON", "convertElementToJSON"],
    requestObj: {
      reqName: "displaySavedElement",
      objectModel: Storage,
      method: "getFromLocalStorage",
      arguments: ["domJSON"],
      callBackObjectModel: DOMConversion,
      callBack: ["displayDOMJSON"],
    },
  },
};

ActionSpaceEditor.processReq(singleReq).then(function(result){
  console.log(result)
})

ActionSpaceEditor.processReqArray(actionFlowModelReq)

ActionSpaceEditor.processReqNestedObject(nestedFlowModelReq)