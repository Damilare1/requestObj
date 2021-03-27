class ActionEngine {
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

var engine = new ActionEngine();
// var DOMJson = engine.processReq(singleReq);
// console.log(DOMJson)

// engine.processReqArray(actionFlowModelReq)

engine.processReqNestedObject(nestedFlowModelReq)