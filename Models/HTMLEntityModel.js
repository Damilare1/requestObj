
/**
 * @type {HTMLJSONEntityModel4Html}
 */
var entityModel4Html={
  tagName: "tagName",
  attributes: {class: "class",style: "style",src: "src",alt: "alt"},
  children: ["all"],
};

var updateDomObject={
  reqName: 'updateDomObject',
  objectModel: document,
  method: 'getElementById',
  arguments: ['output'],
  response: [],
  andThen: ['setAttributesReq'],

}

const modelSchema={
  reqName: {type: String,required: true},
  objectModel: {type: Object,required: true},
  method: {type: Object,required: true},
  arguments: {type: Array,required: false},
  andThen: {type: Array,required: false},
};

var copy2HTMLModel={
  tagName: {
    value: null,
    process: {
      objectModel: Operate,
      method: 'isString',
      arguments: ['tagName']
    }
  },
  attributes: {
    value: {
      class: {
        value: null,
        process: {
          objectModel: Operate,
          method: 'isNode',
          arguments: ['attributes.class',2]
        }
      },
      style: {
        value: null,
        process: {
          objectModel: Operate,
          method: 'isNode',
          arguments: ['attributes.style',2]
        },
      },
      src: {
        value: null,
        process: {
          objectModel: Operate,
          method: 'isNode',
          arguments: ['attributes.src',2]
        },
      },
      alt: {
        value: null,
        process: {
          objectModel: Operate,
          method: 'isNode',
          arguments: ['attributes.alt',2]
        },
      }
    },
    process: {
      objectModel: Operate,
      method: 'isObject',
      arguments: ['attributes']
    }
  },children: {
    value: null,
    process: {
      objectModel: Operate,
      method: 'isHTMLCollection',
      arguments: ['children']
    },
  },
}
