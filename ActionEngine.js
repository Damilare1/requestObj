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
    if (reqObj.arguments) {
      for (var i = 0; i < reqObj.arguments.length; i++) {
        if (reqObj.arguments[i] === "fromPrevious") {
          reqObj.arguments[i] = resultObj;
        }
      }
    }

    var processResult;

    if (method && Operate.isFunction(method)) {
      processResult = method.apply(reqObj.objectModel, reqObj.arguments);
    }
    if (Operate.isObject(method)) {
      processResult = method[reqObj.arguments]
    }
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
      for (var i = 0; i < flowRequest.length; i++) {
        var request = flowRequest[i];
        var args = request.arguments;
        var requestArgs = [];
        for (var p = 0; p < args.length; p++) {
          var reqArg = args[p];
          if (state[reqArg]) { requestArgs[p] = state[reqArg]; }
          else { requestArgs[p] = reqArg; }
        }
        var updatedRequest = { ...request, arguments: requestArgs };
        const result = this.processReq(updatedRequest);
        if (result) {
          state[request.reqName] = result;
        }
      }
    }
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
      var reqArg = request.arguments;
      var requestArgs = [];
      for (var j = 0; j < reqArg.length; j++) {
        if (this._flowResultState[reqArg]) {
          requestArgs[j] = this._flowResultState[reqArg]
        } else {
          requestArgs[j] = reqArg;
        }
      }
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
var DOMJson = engine.processReq(singleReq);
console.log(DOMJson)

engine.processReqArray(actionFlowModelReq)

engine.processReqNestedObject(nestedFlowModelReq)