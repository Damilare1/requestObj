class ActionEngine {
    constructor() {
        this._flowResultState = {};
    }

    processReq(reqObj, resultObj = null) {
        // if (Validators.isNestedRequest(reqObj)) {
        //     return this.processReqNestedObject(reqObj);
        // }
        if (Validators.isFlowRequest(reqObj)) {
            return this.processReqArray(reqObj);
        }
        if (Validators.isSingleRequest(reqObj)) {
            return this.processSingleReq(reqObj, resultObj);
        }
        throw new Error("Request type not supported")
    }

    /**
     * processes single request
     * @param {RequestObj} reqObj - request object
     * @param {unknown} [resultObj=null] - Optional parameter for passing result of previous requests
     * @returns {Promise}
     */
    processSingleReq(reqObj, resultObj = null) {
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
        if (reqObj.andThen) {
            for (var i = 0; i < reqObj.andThen.length; i++) {
                processResult = processResult[reqObj.andThen[i]]
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
                    var requestArgs = getRequestArgs.apply(this, [args, this._flowResultState]);
                    var updatedRequest = {...request, arguments: requestArgs };
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
            var requestArgs = getRequestArgs.apply(this, [reqArg, this._flowResultState])
            var updatedRequest = {...request, arguments: requestArgs };
            var tempRequest = {};
            for (var [key, value] of Object.entries(updatedRequest)) {
                if (key !== "andThen") {
                    tempRequest[key] = value
                }
            }
            var result = this.processReq(tempRequest);
            if (result) {
                this._flowResultState[request.reqName] = result;
            }

            if (request.andThen && Operate.isArray(request.andThen)) {
                var nestedReqArray = request.andThen;
                for (var i = 0; i < nestedReqArray.length; i++) {
                    var nestedReq = window[nestedReqArray[i]];
                    if (nestedReq) {
                        if (nestedReq.objectModel === 'fromParent') {
                            nestedReq.objectModel = result;
                        }
                        var indexOfFromPrevious = nestedReq.arguments.indexOf("fromPrevious");
                        var indexOfParentResult = nestedReq.arguments.indexOf("fromParent");
                        if (indexOfParentResult != -1) {
                            nestedReq.arguments[indexOfParentResult] = result
                        }
                        if (indexOfFromPrevious != -1 && i > 0) {
                            nestedReq.arguments[indexOfFromPrevious] = this._flowResultState[window[nestedReqArray[i - 1]].reqName]
                        }
                    }
                    recursiveThen.call(this, nestedReq);
                }

            }
        }
        recursiveThen.call(this, reqObj);
    }
}

var engine = new ActionEngine();
var DOMJson = engine.processReq(singleReq);


var html = engine.processSingleReq(getInnerHTML)
console.log(html)

// engine.processReq(nestedFlowModelReq)