/*!
 * ${copyright}
 */

// import lodash from 'lodash';
// console.log(Meteor.require);
// console.log(Meteor.Npm);
// console.log(Npm);

// require('node_modules/lodash');

// Provides the base implementation for all model implementations
sap.ui.define([
  'jquery.sap.global',
  'sap/ui/model/Model',
  'sap/ui/model/BindingMode',
  'sap/ui/model/Context',
  './DocumentListBinding',
  './PropertyListBinding',
  './PropertyBinding',
  './ContextBinding',
  'sap/ui/model/FilterOperator',
], function(
  jQuery,
  Model,
  BindingMode,
  Context,
  DocumentListBinding,
  PropertyListBinding,
  PropertyBinding,
  ContextBinding,
  FilterOperator) {
  "use strict";

  /**
   * The SAPUI5 Data Binding API.
   *
   * The default binding mode for model implementations (if not implemented otherwise) is two way and the supported binding modes by the model
   * are one way, two way and one time. The default binding mode can be changed by the application for each model instance.
   * A model implementation should specify its supported binding modes and set the default binding mode accordingly
   * (e.g. if the model supports only one way binding the default binding mode should also be set to one way).
   *
   * The default size limit for models is 100. The size limit determines the number of entries used for the list bindings.
   *
   *
   * @namespace
   * @name sap.ui.model
   * @public
   */

  /**
   * Constructor for a new Model.
   *
   * Every Model is a MessageProcessor that is able to handle Messages with the normal binding path syntax in the target.
   *
   * @class
   * This is an abstract base class for model objects.
   * @abstract
   *
   * @extends sap.ui.core.message.MessageProcessor
   *
   * @author SAP SE
   * @version ${version}
   *
   * @constructor
   * @public
   * @alias meteor-ui5.model.mongo.Model
   */
  var cModel = Model.extend("meteor-ui5.model.mongo.Model", /** @lends meteor-ui5.model.mongo.Model.prototype */ {

    constructor: function(iSizeLimit) {
      Model.apply(this, arguments);

      this.oData = {};
      this.bDestroyed = false;
      this.aBindings = [];
      this.mContexts = {};
      this.iSizeLimit = iSizeLimit || 100;
      this.sDefaultBindingMode = BindingMode.OneWay;
      this.mSupportedBindingModes = {
        "OneWay": true,
        "TwoWay": false,
        "OneTime": false
      };
      this.bLegacySyntax = false;
      this.sUpdateTimer = null;
    },

  });


  /**
   * Return new PropertyBinding for given parameters
   *
   * @name meteor-ui5.model.mongo.Model.prototype.bindProperty
   * @function
   * @param {string}
   *         sPath the path pointing to the property that should be bound
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @return {sap.ui.model.PropertyBinding}
   *
   * @public
   */
  cModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
    var oBinding = new PropertyBinding(this, sPath, oContext, mParameters);
    return oBinding;
  }


  /**
   * Return new DocumentListBinding for given parameters
   *
   * @name meteor-ui5.model.mongo.Model.prototype.bindList
   * @function
   * @param {string}
   *         sPath the path pointing to the list / array that should be bound
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {sap.ui.model.Sorter}
   *         [aSorters=null] initial sort order (can be either a sorter or an array of sorters) (optional)
   * @param {array}
   *         [aFilters=null] predefined filter/s (can be either a filter or an array of filters) (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @return {sap.ui.model.ListBinding}

   * @public
   */
  cModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
    var oBinding;
    if (oContext) {
      // Binding list to array property in single document
      oBinding = new PropertyListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
    } else {
      // Binding list to documents in Mongo
      oBinding = new DocumentListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
    }
    return oBinding;
  }

  /**
   * Implement in inheriting classes
   * @abstract
   *
   * @name meteor-ui5.model.mongo.Model.prototype.bindTree
   * @function
   * @param {string}
   *         sPath the path pointing to the tree / array that should be bound
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {array}
   *         [aFilters=null] predefined filter/s contained in an array (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @param {array}
   *         [aSorters=null] predefined sap.ui.model.sorter/s contained in an array (optional)
   * @return {sap.ui.model.TreeBinding}

   * @public
   */
  // TODO implement this.  Check first if controls that use this haven't all been
  // deprecated.

  /**
   * Create binding context. (Implementation copied from ClientModel.js)
   *
   * @name meteor-ui5.model.mongo.Model.prototype.createBindingContext
   * @function
   * @param {string}
   *         sPath the path to create the new context from
   * @param {object}
   *		   [oContext=null] the context which should be used to create the new binding context
   * @param {object}
   *		   [mParameters=null] the parameters used to create the new binding context
   * @param {function}
   *         [fnCallBack] the function which should be called after the binding context has been created
   * @param {boolean}
   *         [bReload] force reload even if data is already available. For server side models this should
   *                   refetch the data from the server
   * @return {sap.ui.model.Context} the binding context, if it could be created synchronously
   *
   * @public
   */
  cModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack) {
    // optional parameter handling
    if (typeof oContext == "function") {
      fnCallBack = oContext;
      oContext = null;
    }
    if (typeof mParameters == "function") {
      fnCallBack = mParameters;
      mParameters = null;
    }
    // resolve path and create context
    var sContextPath = this.resolve(sPath, oContext),
      oNewContext = (sContextPath == undefined) ? undefined : this.getContext(sContextPath ? sContextPath : "/");
    if (!oNewContext) {
      oNewContext = null;
    }
    if (fnCallBack) {
      fnCallBack(oNewContext);
    }
    return oNewContext;
  };

  /**
   * Implement in inheriting classes
   * @abstract
   *
   * @name meteor-ui5.model.mongo.Model.prototype.destroyBindingContext
   * @function
   * @param {object}
   *         oContext to destroy

   * @public
   */
  //TODO implement this

  /**
   * Alternative to lodash _.get so we don't have to include whole library
   *
   * Code taken from: https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
   * TODO: test that this works in all likely instances
   * @param  {[type]} obj [description]
   * @param  {[type]} path   [description]
   * @param  {[type]} def    [description]
   * @return {[type]}        [description]
   */
  cModel.prototype._get = function(obj, path, def) {
    var fullPath = path
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .split('.')
      .filter(Boolean);

    return fullPath.every(everyFunc) ? obj : def;

    function everyFunc(step) {
      return !(step && (obj = obj[step]) === undefined);
    }
  };


  /**
   * Implement in inheriting classes
   * @abstract
   *
   * @name meteor-ui5.model.mongo.Model.prototype.getProperty
   * @function
   * @param {string}
   *         sPath the path to where to read the attribute value
   * @param {object}
   *		   [oContext=null] the context with which the path should be resolved
   * @public
   */
  cModel.prototype.getProperty = function(sPath, oContext) {
    let propertyValue;

    // Check we have a context or we can't return a property - not yet sure
    // why this is sometimes being called when context hasn't been set yet
    // (Grid Table)
    if (!oContext) {
      return;
    }

    // Get single document
    var oComponents = this._getPathComponents(sPath, oContext);
    // collectionName: "",
    // documentId: "",
    // propertyPath: "",
    var document = Mongo.Collection.get(oComponents.collectionName).findOne(oComponents.documentId);
    if (document) {
      if (oComponents.propertyPath) {
        // Return property
        if (oComponents.propertyPath.charAt(0) === "?") {
          propertyValue = this._getLookupProperty(document, oComponents.propertyPath);
        } else {
          // Regular property - get from current document
          propertyValue = this._get(document, oComponents.propertyPath);
        }
      } else {
        // Return document (e.g. called by getObject)
        propertyValue = document;
      }
    }

    return propertyValue;
  }

  cModel.prototype._getLookupProperty = function(oCurrentDocument, sLookupPath) {
    // This is a lookup query, e.g.: "?Customers(CustomerID)/CompanyName"
    // Create context and path to lookup property in another collection

    // Build context path for querying lookup collection.  Note:
    // components.documentId actually contains property name in
    // current document
    var oLookupComponents = this._getPathComponents(sLookupPath);
    const sLookupContextPath =
      "/" +
      oLookupComponents.collectionName +
      "(" +
      oCurrentDocument[oLookupComponents.documentId] +
      ")";

    // Get context for querying lookup collection if it already exists
    // or create one
    const oLookupContext = this.getContext(sLookupContextPath);

    // Call standard getProperty with new context and path property
    return this.getProperty(
      oLookupComponents.propertyPath,
      oLookupContext
    );
  }

  /**
   * Implement in inheriting classes
   * @abstract
   *
   * @param {string}
   *         sPath the path to where to read the object
   * @param {object}
   *		   [oContext=null] the context with which the path should be resolved
   * @public
   */
  cModel.prototype.getObject = function(sPath, oContext) {
    return this.getProperty(sPath, oContext);
  };

  /* Resolve and return all components from path */
  cModel.prototype._getPathComponents = function(sPath, oContext) {

    // Define object this method returns.  Some or all properties will be
    // set in this method.
    let oComponents = {
      collectionName: "",
      documentId: "",
      propertyPath: "",
    };

    // Resolve path from oContext and sPath into one full path
    let sFullPath = oContext ? this.resolve(sPath, oContext) : sPath;

    // Validate path
    const sFirstChar = sFullPath.charAt(0);
    if (sFirstChar === "?") {
      // Question mark denotes Meteor Mongo model Lookup binding path
      // Convert it to a regular root (non-relative path)
      sFullPath = "/" + sFullPath.slice(1);
    } else if (sFirstChar !== "/") {
      const sError = "Cannot find root element (Mongo Collection).";
      jQuery.sap.log.fatal(sError);
      this.fireParseError({
        srcText: sError
      });
    }

    // Split path into components at forward slash
    var aComponents = sFullPath.split("/");
    if (aComponents[0] === "") {
      aComponents.shift();
    }

    // Validate components
    if (aComponents.length < 1) {
      var sError = "Unsupported binding path: " + sFullPath;
      jQuery.sap.log.fatal(sError);
      oModel.fireParseError({
        srcText: sError
      });
    }

    // Interpret first componet - Collection name - possibly with document id
    const sCollectionComponent = aComponents[0];
    const openParens = sCollectionComponent.indexOf("(");
    if (openParens < 0) {
      // No document id - whole component is collection name
      oComponents.collectionName = sCollectionComponent;
    } else {
      // Get collection name and document id
      const closeParens = sCollectionComponent.indexOf(")");
      oComponents.collectionName = sCollectionComponent.substring(0, openParens);
      oComponents.documentId = sCollectionComponent.substring(openParens + 1, closeParens);
    }

    // Return remaining components as property path
    aComponents.shift();
    var sPropertyPath = aComponents.join('.');
    if (sPropertyPath) {
      var iCloseParens = sPropertyPath.indexOf(")");
      if (iCloseParens > -1) {
        // Replace period directly after closing parenthesis with "/"
        // TODO fix this hack - don't quite understand yet why this is necessary
        // but seems to be for lookups.
        var iFirstAfterCloseParens = iCloseParens + 1;
        if (sPropertyPath.charAt(iFirstAfterCloseParens) === ".") {
          sPropertyPath = sPropertyPath.substr(0, iFirstAfterCloseParens) + "/" +
            sPropertyPath.substr(iCloseParens + 1);
        }
      }
    }
    oComponents.propertyPath = sPropertyPath;

    return oComponents;
  };

  /* Builds and runs mongo collection find and returns meteor cursor */
  cModel.prototype.runQuery = function(sPath, oContext, aSorters, aFilters) {
    // Resolve path and get components (collection name, document id)
    var oPathComponents = this._getPathComponents(sPath, oContext);

    // Get Collection
    var oCollection = Mongo.Collection.get(oPathComponents.collectionName);

    // Build mongo selector
    let selector = {};
    if (oPathComponents.documentId) {
      selector._id = oPathComponents.documentId;
    } else if (aFilters && aFilters.length) {
      selector = this._buildMongoSelector(aFilters);
    }

    // Build query options
    let options = {
      limit: this.iSizeLimit
    };

    // Build sorter option
    if (aSorters && aSorters.length) {
      options.sort = this._buildMongoSortSpecifier(aSorters);
    }

    // Execute query and return cursor
    const oCursor = oCollection.find(selector, options);
    return oCursor;

  }

  cModel.prototype._buildMongoSelector = function(aFilters) {
    let oMongoSelector = {};
    // Build mongo selector incorporating each filter

    // Build set of properties with an array of filters for each.  These will
    // will be combined with and/or conditions into the mongo selector later
    const properties = new Map();
    aFilters.forEach((oFilter) => {
      // Validate: We don't currently support multi-filter
      if (oFilter._bMultiFilter) {
        const sError = "MultiFilter not yet supported by ListBinding.";
        jQuery.sap.log.fatal(sError);
        this.oModel.fireParseError({
          srcText: sError
        });
        return;
      }

      // Build mongo expression according to UI5 filter operator
      // Example filter object:
      // {sPath: "Country", sOperator: "EQ", oValue1: "USA", oValue2: undefined, _bMultiFilter: false}
      let oMongoExpression = {};
      switch (oFilter.sOperator) {
        case FilterOperator.BT:
          oMongoExpression["$gte"] = oFilter.oValue1;
          oMongoExpression["$lte"] = oFilter.oValue2;
          break;
        case FilterOperator.Contains:
          // TODO investigate performance options. Need to also determine if
          // we can dynamically determine and use $text if a text index has been
          // created.
          // In the mean time, build a regex.
          oMongoExpression["$regex"] = new RegExp(oFilter.oValue1);
          oMongoExpression["$options"] = "i"; // case-insensitive
          break;
        case FilterOperator.StartsWith:
          oMongoExpression["$regex"] = new RegExp("^" + oFilter.oValue1);
          oMongoExpression["$options"] = "i"; // case-insensitive
          break;
        case FilterOperator.EndsWith:
          oMongoExpression["$regex"] = new RegExp(oFilter.oValue1 + "$");
          oMongoExpression["$options"] = "i"; // case-insensitive
          break;
        case FilterOperator.EQ:
          // TODO add $eq when supported in mini-mongo (version 1.4?).  Hope this
          // work around doesn't bite us in the mean time.  Refer:
          // https://github.com/meteor/meteor/issues/4142
          oMongoExpression = oFilter.oValue1;
          break;
        case FilterOperator.GE:
          oMongoExpression["$gte"] = oFilter.oValue1;
        case FilterOperator.GT:
          oMongoExpression["$gt"] = oFilter.oValue1;
          break;
        case FilterOperator.LE:
          oMongoExpression["$lte"] = oFilter.oValue1;
          break;
        case FilterOperator.LT:
          oMongoExpression["$lt"] = oFilter.oValue1;
          break;
        case FilterOperator.NE:
          //TODO: Test.  Valid in Mongo, not sure if minimongo supports - see
          // EQ FilterOperator above
          oMongoExpression["$ne"] = oFilter.oValue1;
          break;
        default:
          const sError = "Filter operator " + oFilter.sOperator + " not supported.";
          jQuery.sap.log.fatal(sError);
          this.oModel.fireParseError({
            srcText: sError
          });
          return;
      }

      // Add current property to the map if it doesn't already exist
      const propertyName = oFilter.sPath;
      if (!properties.has(propertyName)) {
        properties.set(propertyName, []);
      }

      // Add current property selector to map
      const propertySelector = {};
      propertySelector[propertyName] = oMongoExpression;
      properties.get(propertyName).push(propertySelector);
    });

    // Combine propery selectors for different properties using mongo $and
    const $and = [];
    properties.forEach(function(expressions) {
      // Combine expressions for single property using mongo $or (if multiple)
      if (expressions.length === 1) {
        $and.push(expressions[0]);
      } else {
        $and.push({
          $or: expressions
        })
      }
    });

    if ($and.length > 1) {
      oMongoSelector["$and"] = $and;
    } else {
      oMongoSelector = $and[0];
    }
    return oMongoSelector;
  };

  cModel.prototype._buildMongoSortSpecifier = function(aSorters) {
    let oMongoSortSpecifier = {};
    aSorters.forEach((oSorter) => {
      // Don't know what options need to be supported yet but currently
      // we only support sorting based on a simple property with ascending or
      // descending option.  Validate that this sorter seems to meet that
      // criteria.
      const bHasSlash = (oSorter.sPath.indexOf("/") > -1);
      const bHasPeriod = (oSorter.sPath.indexOf(".") > -1);
      if (bHasSlash || bHasPeriod) {
        const sError = "Currently unsupported list sorting path: " + oSorter.sPath;
        jQuery.sap.log.fatal(sError);
        this.oModel.fireParseError({
          srcText: sError
        });
        return;
      }

      // Validate that we don't have a custom comparator function (if not possible
      // with Mongo read - may be able to add it later as post query javascript
      // filtering)
      if (oSorter.fnCompare) {
        const sError = "Custom sort comparator functions currently unsupported";
        jQuery.sap.log.fatal(sError);
        this.oModel.fireParseError({
          srcText: sError
        });
        return;
      }

      // Build mongo sort specifier
      oMongoSortSpecifier[oSorter.sPath] = oSorter.bDescending ? -1 : 1;
    });

    return oMongoSortSpecifier;
  };


  /**
   * Create ContextBinding
   * @abstract
   *
   * @name meteor-ui5.model.mongo.Model.prototype.bindContext
   * @function
   * @param {string | object}
   *         sPath the path pointing to the property that should be bound or an object
   *         which contains the following parameter properties: path, context, parameters
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @param {object}
   *         [oEvents=null] event handlers can be passed to the binding ({change:myHandler})
   * @return {sap.ui.model.ContextBinding}
   *
   * @public
   */
  cModel.prototype.bindContext = function(sPath, oContext, mParameters) {
    var oBinding = new ContextBinding(this, sPath, oContext, mParameters);
    return oBinding;
  };

  /**
   * @see sap.ui.model.Model.prototype.bindElement
   *
   */

  /**
   * Gets a binding context. If context already exists, return it from the map,
   * otherwise create one using the context constructor.
   *
   * @param {string} sPath the path
   */
  cModel.prototype.getContext = function(sPath) {
    if (!jQuery.sap.startsWith(sPath, "/")) {
      throw new Error("Path " + sPath + " must start with a / ");
    }
    var oContext = this.mContexts[sPath];
    if (!oContext) {
      oContext = new Context(this, sPath);
      this.mContexts[sPath] = oContext;
    }
    return oContext;
  };

  /**
   * Resolve the path relative to the given context.
   *
   * If a relative path is given (not starting with a '/') but no context,
   * then the path can't be resolved and undefined is returned.
   *
   * For backward compatibility, the behavior of this method can be changed by
   * setting the 'legacySyntax' property. Then an unresolvable, relative path
   * is automatically converted into an absolute path.
   *
   * @param {string} sPath path to resolve
   * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
   * @return {string} resolved path or undefined
   */
  cModel.prototype.resolve = function(sPath, oContext) {
    var bIsRelative = typeof sPath == "string" && !jQuery.sap.startsWith(sPath, "/"),
      sResolvedPath = sPath,
      sContextPath;
    if (bIsRelative) {
      if (oContext) {
        sContextPath = oContext.getPath();
        sResolvedPath = sContextPath + (jQuery.sap.endsWith(sContextPath, "/") ? "" : "/") + sPath;
      } else {
        sResolvedPath = this.isLegacySyntax() ? "/" + sPath : undefined;
      }
    }
    if (!sPath && oContext) {
      sResolvedPath = oContext.getPath();
    }
    // invariant: path never ends with a slash ... if root is requested we return /
    if (sResolvedPath && sResolvedPath !== "/" && jQuery.sap.endsWith(sResolvedPath, "/")) {
      sResolvedPath = sResolvedPath.substr(0, sResolvedPath.length - 1);
    }
    return sResolvedPath;
  };

  /**
   * Destroys the model and clears the model data.
   * A model implementation may override this function and perform model specific cleanup tasks e.g.
   * abort requests, prevent new requests, etc.
   *
   * @see sap.ui.base.Object.prototype.destroy
   * @public
   */
  cModel.prototype.destroy = function() {
    // Call destroy on each binding where method exists
    this.aBindings.forEach(function(oBinding) {
      if (oBinding.hasOwnProperty("destroy")) {
        oBinding.destroy();
      }
    });

    // Call super
    Model.prototype.destroy.apply(this, arguments);
  };

  return cModel;

});
