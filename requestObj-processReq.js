var entityModel = {
  name: {
    value: "input.nameTagName",
    process: [
      {
        objectModel: "operate",
        method: "isInsideArray",
        arguments: "HTMLElementList",
      },
    ],
  },
  // description : "",
  id: {
    value: "input.id",
    operator: [
      {
        method: "isInsideArray",
        arguments: "HTMLElementList",
      },
    ],
  },
  entityType: {
    value: "operate.is(input)",
    operator: [
      {
        method: "isOptional",
        arguments: "value",
      },
    ],
  },
  resource: {
    value: "input.url",
    operate: ["isUrl"],
  },
  attributes: {
    value: null,
    operate: [find("input.attributes", ["class", "style", "src"])],
  },
  getElementByTagName: (name) => {
    return document.getElementsByTagName(name);
  },
  getElementById: (id) => {
    return document.getElementById(id);
  },
  getAllDivs: () => {
      return document.getElementsByTagName(div);
  },
  content: "",
  contentMimeType: "", //[HTML,JSON,TEXT,JAVASCRIPT],
  resourceBinding: "",
};

var setEntityReq = {
  objectModel: Entity,
  method: "set",
  arguments: [{ previous: "response" }, "output", "key"],
};

var displayRes = {
  reqName: "displayRes",
  objectModel: output,
  method: "ConsoleOutput",
  arguments: [{ previous: "response" }],
};

class Output {
  constructor(input, output) {
    this.entity = process.processReq(input, output);
    console.log("Entity Created", this);
  }
  static ConsoleOutput(output) {
    console.log(output);
  }
}

const processReq = {
  reqName: "getElement",
  objectModel: entityModel,
  entity: "id",
  method: "getElementById",
  arguments: ["value"],
  response: [],
  andThen: ["displayRes"],
};

const processReqArray = {
  reqName: "getElement",
  objectModel: entityModel,
  entity: [
    {
      entity: "name",
      method: "getElementByTagName",
      arguments: ["value"],
    },
    {
      entity: "id",
      method: "getElementById",
      arguments: ["value"],
    },
  ],
  response: [],
  andThen: ["displayRes"],
};

const processReqNested = {
  reqName: "getElement",
  objectModel: entityModel,
  entity: {
    method: "getAllDivs",
    arguments: [],
    entity: {
      entity: "id",
      method: "getElementById",
      arguments: ["value"],
    },
  },
  response: [],
  andThen: ["nextReq"],
};
