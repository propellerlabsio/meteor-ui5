/**
 * @file meteor-ui5.model.mongo.Model.js
 * @copyright PropellerLabs.io 2016
 * @license Apache-2.0
 *
 * @namespace meteor-ui5.model.mongo
 * @description Meteor UI5 Mongo Model
 */
/* globals sap, Meteor, Mongo */
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
], function constructor( // eslint-disable-line prefer-arrow-callback
  jQuery,
  Model,
  BindingMode,
  Context,
  DocumentListBinding,
  PropertyListBinding,
  PropertyBinding,
  ContextBinding,
  FilterOperator
) {
  /**
   * @summary Constructor for a new Model.
   *
   * @description This model provides the interface between UI5 and a Meteor
   * application that uses  the Mongo and Minimongo databases.
   *
   * @class
   *
   * @extends sap.ui.model.Model
   *
   * @author PropellerLabs.io
   * @version ${version}
   *
   * @constructor
   * @public
   * @alias meteor-ui5.model.mongo.Model
   */
  const cModel = Model.extend('meteor-ui5.model.mongo.Model', {

    constructor(iSizeLimit) {
      Model.apply(this, iSizeLimit);

      this.oData = {};
      this.bDestroyed = false;
      this.aBindings = [];
      this.mContexts = {};
      this.iSizeLimit = iSizeLimit || 100;
      this.sDefaultBindingMode = BindingMode.OneWay;
      this.mSupportedBindingModes = {
        OneWay: true,
        TwoWay: false,
        OneTime: false
      };
      this.bLegacySyntax = false;
      this.sUpdateTimer = null;
    },

  });


  /**
   * Return new PropertyBinding for given parameters
   *
   * @param {string}
   *         sPath the path pointing to the property that should be bound
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @return {meteor-ui5.model.mongo.PropertyBinding}
   *
   * @public
   */
  cModel.prototype.bindProperty = function bindProperty(sPath, oContext, mParameters) {
    const oBinding = new PropertyBinding(this, sPath, oContext, mParameters);
    return oBinding;
  };

  /**
   * @summary Return new list binding of appropriate type for given parameters
   *
   * @description Returns either a DocumentListBinding or PropetyListBinding
   * depending on whether we are binding to a list of documents or an array
   * property in a single document.
   *
   * @param {string}
   *         sPath the path pointing to the list / array that should be bound
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {sap.ui.model.Sorter}
   *         [aSorters=null] initial sort order (can be either a sorter or an array
   *         of sorters) (optional)
   * @param {array}
   *         [aFilters=null] predefined filter/s (can be either a filter or an array
   *         of filters) (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @return {meteor-ui5.model.mongo.DocumentListBinding |
   *         meteor-ui5.model.mongo.PropertyListBinding}

   * @public
   */
  cModel.prototype.bindList = function bindList(sPath, oContext, aSorters, aFilters, mParameters) {
    let oBinding;
    if (oContext) {
      // Binding list to array property in single document
      oBinding = new PropertyListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
    } else {
      // Binding list to documents in Mongo
      oBinding = new DocumentListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
    }
    return oBinding;
  };

  /**
   * @summary Tree binding not yet implemented.
   *
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
   * @return {meteor-ui5.model.mongo.TreeBinding}

   * @public
   */
  // TODO implement this.  Check first if controls that use this haven't all been
  // deprecated.

  /**
   * @summary Create binding context.
   *
   * @description Implementation copied from sap.ui.model.ClientModel
   *
   * @param {string}
   *         sPath the path to create the new context from
   * @param {object}
   *		   [oContext=null] the context which should be used to create the new
   *		   binding context
   * @param {object}
   *		   [mParameters=null] the parameters used to create the new binding context
   * @param {function}
   *         [fnCallBack] the function which should be called after the binding
   *         context has been created
   * @param {boolean}
   *         [bReload] force reload even if data is already available. For server
   *         side models this should refetch the data from the server
   * @return {sap.ui.model.Context} the binding context, if it could be created
   *         synchronously
   *
   * @public
   */
  cModel.prototype.createBindingContext = function createBindingContext(
    sPath, oContext, mParameters, fnCallBack
  ) {
    // WARNING: Original code was copied from ClientModel.  Contained a lot of
    // parameter reassignment that eslint objected to so have removed it.
    // Refer to the original implementation in sap.ui.model.ClientModel if
    // there are any bugs in this code.
    // resolve path and create context
    let sContextPath = this.resolve(sPath, oContext);
    sContextPath = sContextPath || '/';
    let oNewContext = (sContextPath === undefined) ?
      undefined :
      this.getContext(sContextPath);
    if (!oNewContext) {
      oNewContext = null;
    }
    if (fnCallBack) {
      fnCallBack(oNewContext);
    }
    return oNewContext;
  };

  /**
   * @summary Destroys a binding context
   *
   * @param {object}
   *         oContext to destroy
   * @public
   */
  cModel.prototype.destroyBindingContext = function destroyBindingContext(oContext) {
    // Was previously checking if context had destroy property but eslint is
    // complaining with no-prototype-builtins.  Changed my code to match
    // eslint doc and just throws a different eslint error.  Removing check
    // altogether now.  Haven't got a hundred hours to spend on this and every
    // meteor-ui5 context should provide destroy method.
    // http://eslint.org/docs/rules/no-prototype-builtins
    oContext.destroy();
  };

  /**
   * @summary Returns the value of a property at a given path in a given context.
   *
   * @description Resolves a context and path and returns the value (of any
   * data type).  This method also handles Lookup Property paths in the form of
   * ?Customers('CustomerID') where ?Customers is the Mongo collection to be
   * queried and 'CustomerId' is the name of the property at the current path
   * that contains the unique Mongo Id of the customer document.
   * @see meteor-ui5.model.mongo.Model.prototype._getLookupProperty
   *
   * @param {string}
   *         sPath the path to where to read the attribute value
   * @param {object}
   *		   [oContext=null] the context with which the path should be resolved
   * @return {object|object[]|string|number}
   * @public
   */
  cModel.prototype.getProperty = function getProperty(sPath, oContext) {
    let propertyValue = null;

    // Check we have a context or we can't return a property - not yet sure
    // why this is sometimes being called when context hasn't been set yet
    // (ie from Grid Table)
    if (!oContext) {
      return propertyValue;
    }

    // Get single document
    const oComponents = this._getPathComponents(sPath, oContext);
    const document = Mongo.Collection.get(oComponents.collectionName)
      .findOne(oComponents.documentId);
    if (document) {
      if (oComponents.propertyPath) {
        // Return property
        if (oComponents.propertyPath.charAt(0) === '?') {
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
  };


  /**
   * @summary Returns the value of a property for a lookup query
   *
   * @description This method handles Lookup Property paths in the form of
   * ?Customers('CustomerID') where ?Customers is the Mongo collection to be
   * queried and 'CustomerId' is the name of the property in the current document
   * that contains the unique Mongo Id of the customer document.
   *
   * @param {object}
   *		   oCurrentDocument the document containing the id of the lookup document
   * @param {string}
   *         sLookupPath the path to where to read the attribute value
   * @return {object|object[]|string|number}
   * @private
   */
  cModel.prototype._getLookupProperty = function _getLookupProperty(oCurrentDocument, sLookupPath) {
    // Build context path for querying lookup collection.  Note:
    // components.documentId actually contains property name in
    // current document
    const oLookupComponents = this._getPathComponents(sLookupPath);
    const sLookupContextPath =
      `/${oLookupComponents.collectionName}(${oCurrentDocument[oLookupComponents.documentId]})`;

    // Get context for querying lookup collection if it already exists
    // or create one
    const oLookupContext = this.getContext(sLookupContextPath);

    // Call standard getProperty with new context and path property
    return this.getProperty(
      oLookupComponents.propertyPath,
      oLookupContext
    );
  };

  /**
   * @summary Resolves a path and context and returns Mongo components
   *
   * @description For a given path and context, return Mongo components such
   * as collection name, document id.  The remainder of the path is returned
   * as a value that can be resolved against a document using _.get()
   *
   * @param {string}
   *         sPath the path to where to read the attribute value
   * @param {object}
   *		   [oContext=null] the context with which the path should be resolved
   * @return {object}
   *         Object containing collectionName, documentId and propertyPath
   * @private
   */
  cModel.prototype._getPathComponents = function _getPathComponents(sPath, oContext) {
    // Define object this method returns.  Some or all properties will be
    // set in this method.
    const oComponents = {
      collectionName: '',
      documentId: '',
      propertyPath: '',
    };

    // Resolve path from oContext and sPath into one full path
    let sFullPath = oContext ? this.resolve(sPath, oContext) : sPath;

    // Validate path
    const sFirstChar = sFullPath.charAt(0);
    if (sFirstChar === '?') {
      // Question mark denotes Meteor Mongo model Lookup binding path
      // Convert it to a regular root (non-relative path)
      sFullPath = `/${sFullPath.slice(1)}`;
    } else if (sFirstChar !== '/') {
      const sError = 'Cannot find root element (Mongo Collection).';
      jQuery.sap.log.fatal(sError);
      this.fireParseError({
        srcText: sError
      });
    }

    // Split path into components at forward slash
    const aComponents = sFullPath.split('/');
    if (aComponents[0] === '') {
      aComponents.shift();
    }

    // Validate components
    if (aComponents.length < 1) {
      const sError = `Unsupported binding path: ${sFullPath}`;
      jQuery.sap.log.fatal(sError);
      this.fireParseError({
        srcText: sError
      });
    }

    // Interpret first componet - Collection name - possibly with document id
    const sCollectionComponent = aComponents[0];
    const openParens = sCollectionComponent.indexOf('(');
    if (openParens < 0) {
      // No document id - whole component is collection name
      oComponents.collectionName = sCollectionComponent;
    } else {
      // Get collection name
      oComponents.collectionName = sCollectionComponent.substring(0, openParens);

      // Get document id which will either be a string (created by Meteor) or
      // and ObjectId constructor (created by Mongo via mongo shell, robomongo
      // external database etc)
      const sComponentRemaining = sCollectionComponent.substring(openParens);
      const iOuterParensBegin = 0;
      const iInnerContentLength = sComponentRemaining.length - 1;
      const sDocumentId = sComponentRemaining.substring(
        iOuterParensBegin + 1,
        iInnerContentLength
      );

      // If id not just a string but in the form of ObjectId('adfadf') then
      // create an object id instance
      if (sDocumentId.startsWith('Object')) {
        const openQuote = sDocumentId.indexOf('"');
        const closeQuote = sDocumentId.indexOf('"', openQuote + 1);
        const sInnerDocumentId = sDocumentId.substring(openQuote + 1, closeQuote);
        oComponents.documentId = new Meteor.Collection.ObjectID(sInnerDocumentId);
      } else {
        // Just a regular meteor id string
        oComponents.documentId = sDocumentId;
      }
    }

    // Return remaining components as property path
    aComponents.shift();
    let sPropertyPath = aComponents.join('.');
    if (sPropertyPath) {
      const iCloseParens = sPropertyPath.indexOf(')');
      if (iCloseParens > -1) {
        // Replace period directly after closing parenthesis with '/'
        // TODO fix this hack - don't quite understand yet why this is necessary
        // but seems to be for lookups.
        const iFirstAfterCloseParens = iCloseParens + 1;
        if (sPropertyPath.charAt(iFirstAfterCloseParens) === '.') {
          const beforePeriod = sPropertyPath.substr(0, iFirstAfterCloseParens);
          const afterPeriod = sPropertyPath.substr(iCloseParens + 1);
          sPropertyPath = `${beforePeriod}/${afterPeriod}`;
        }
      }
    }
    oComponents.propertyPath = sPropertyPath;

    return oComponents;
  };

  /**
   * @summary Builds and runs a Mongo query and returns a cursor
   *
   * @description Builds a mongo selector, sort options and runs a query on the
   * database for a context and path.  It returns a cursor that changes can be
   * observed on to provide reactive updates.
   *
   * @param {string} sPath
   * @param {sap.ui.model.Context} oContext
   * @param {array} [aSorters] initial sort order
   * @param {array} [aFilters] predefined filter/s
   * @return {object} A mongo cursor
   * @public
   */
  cModel.prototype.runQuery = function runQuery(sPath, oContext, aSorters, aFilters) {
    // Resolve path and get components (collection name, document id)
    const oPathComponents = this._getPathComponents(sPath, oContext);

    // Get Collection
    const oCollection = Mongo.Collection.get(oPathComponents.collectionName);

    // Build mongo selector
    let selector = {};
    if (oPathComponents.documentId) {
      selector._id = oPathComponents.documentId;
    } else if (aFilters && aFilters.length) {
      selector = this._buildMongoSelector(aFilters);
    }

    // Build query options
    const options = {
      limit: this.iSizeLimit
    };

    // Build sorter option
    if (aSorters && aSorters.length) {
      options.sort = this._buildMongoSortSpecifier(aSorters);
    }

    // Execute query and return cursor
    const oCursor = oCollection.find(selector, options);
    return oCursor;
  };

  /**
   * @summary Creates a new ContextBinding
   *
   * @param {string | object}
   *         sPath the path pointing to the property that should be bound or an object
   *         which contains the following parameter properties: path, context, parameters
   * @param {object}
   *         [oContext=null] the context object for this databinding (optional)
   * @param {object}
   *         [mParameters=null] additional model specific parameters (optional)
   * @param {object}
   *         [oEvents=null] event handlers can be passed to the binding ({change:myHandler})
   * @return {meteor-ui5.model.mongo.ContextBinding}
   *
   * @public
   */
  cModel.prototype.bindContext = function bindContext(sPath, oContext, mParameters) {
    const oBinding = new ContextBinding(this, sPath, oContext, mParameters);
    return oBinding;
  };

  /**
   * @summary Destroys the model and clears the model data.
   *
   * @public
   */
  cModel.prototype.destroy = function destroy() {
    // Call destroy on each binding where method exists
    this.aBindings.forEach((oBinding) => {
      // Eslint complains if I check destroy method exists (no-prototype-builtins).
      // Changing to code in eslint docs throws different eslint error.  Removing
      // check.
      oBinding.destroy();
    });

    // Call super
    Model.prototype.destroy.apply(this);
  };

  /**
   * @summary Build Mongo selector for UI5 filters
   * @param  {sap.ui.filter[]} aFilters An array of UI5 filters
   * @return {object}          A mongo selector for use with collection.Find or FindOne
   */
  cModel.prototype._buildMongoSelector = function _buildMongoSelector(aFilters) {
    let oMongoSelector = {};
    // Build mongo selector incorporating each filter

    // Build set of properties with an array of filters for each.  These will
    // will be combined with and/or conditions into the mongo selector later
    const properties = new Map();
    aFilters.forEach((oFilter) => {
      // Validate: We don't currently support multi-filter
      if (oFilter._bMultiFilter) {
        const sError = 'MultiFilter not yet supported by ListBinding.';
        jQuery.sap.log.fatal(sError);
        this.oModel.fireParseError({
          srcText: sError
        });
        return;
      }

      // Build mongo expression according to UI5 filter operator
      // Example filter object:
      // {sPath: 'Country', sOperator: 'EQ', oValue1: 'USA', oValue2: undefined,
      // _bMultiFilter: false}
      let oMongoExpression = {};
      let sError = '';
      switch (oFilter.sOperator) {
        case FilterOperator.BT:
          oMongoExpression.$gte = oFilter.oValue1;
          oMongoExpression.$lte = oFilter.oValue2;
          break;
        case FilterOperator.Contains:
          // TODO investigate performance options. Need to also determine if
          // we can dynamically determine and use $text if a text index has been
          // created.
          // In the mean time, build a regex.
          oMongoExpression.$regex = new RegExp(oFilter.oValue1);
          oMongoExpression.$options = 'i'; // case-insensitive
          break;
        case FilterOperator.StartsWith:
          oMongoExpression.$regex = new RegExp(`^${oFilter.oValue1}`);
          oMongoExpression.$options = 'i'; // case-insensitive
          break;
        case FilterOperator.EndsWith:
          oMongoExpression.$regex = new RegExp(`${oFilter.oValue1}$`);
          oMongoExpression.$options = 'i'; // case-insensitive
          break;
        case FilterOperator.EQ:
          // TODO add $eq when supported in mini-mongo (version 1.4?).  Hope this
          // work around doesn't bite us in the mean time.  Refer:
          // https://github.com/meteor/meteor/issues/4142
          oMongoExpression = oFilter.oValue1;
          break;
        case FilterOperator.GE:
          oMongoExpression.$gte = oFilter.oValue1;
          break;
        case FilterOperator.GT:
          oMongoExpression.$gt = oFilter.oValue1;
          break;
        case FilterOperator.LE:
          oMongoExpression.$lte = oFilter.oValue1;
          break;
        case FilterOperator.LT:
          oMongoExpression.$lt = oFilter.oValue1;
          break;
        case FilterOperator.NE:
          // TODO: Test.  Valid in Mongo, not sure if minimongo supports - see
          // EQ FilterOperator above
          oMongoExpression.$ne = oFilter.oValue1;
          break;
        default:
          sError = `Filter operator ${oFilter.sOperator} not supported.`;
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
    properties.forEach((expressions) => {
      // Combine expressions for single property using mongo $or (if multiple)
      if (expressions.length === 1) {
        $and.push(expressions[0]);
      } else {
        $and.push({
          $or: expressions
        });
      }
    });

    if ($and.length > 1) {
      oMongoSelector.$and = $and;
    } else {
      oMongoSelector = $and[0];
    }
    return oMongoSelector;
  };

  /**
   * @summary Build's a mongo sort specifier for use with collection.find()
   *
   * @description Takes an array of standard UI5 sorters and converts to a single
   * Mongo sort specifier.
   * @param  {sap.ui.model.sorter[]} aSorters An array of UI5 sorters
   * @return {object}          Mongo sort specifier
   * @private
   */
  cModel.prototype._buildMongoSortSpecifier = function _buildMongoSortSpecifier(aSorters) {
    const oMongoSortSpecifier = {};
    aSorters.forEach((oSorter) => {
      // Don't know what options need to be supported yet but currently
      // we only support sorting based on a simple property with ascending or
      // descending option.  Validate that this sorter seems to meet that
      // criteria.
      const bHasSlash = (oSorter.sPath.indexOf('/') > -1);
      const bHasPeriod = (oSorter.sPath.indexOf('.') > -1);
      if (bHasSlash || bHasPeriod) {
        const sError = `Currently unsupported list sorting path: ${oSorter.sPath}`;
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
        const sError = 'Custom sort comparator functions currently unsupported';
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
   * @summary Alternative to lodash _.get so we don't have to include whole library
   *
   * @description Code taken from:
   * https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
   * TODO: test that this works in all likely instances
   *
   * @param  {object} obj The object containing the desired property
   * @param  {string} path The path to the property
   * @param  {*} def Default value if property not found
   * @return {*} The property value
   *
   * @private
   */
  cModel.prototype._get = function _get(obj, path, def) {
    function everyFunc(step) {
      const next = obj[step];
      return !(step && (next === undefined));
    }

    const fullPath = path
      .replace(/\[/g, '.')
      .replace(/]/g, '')
      .split('.')
      .filter(Boolean);

    return fullPath.every(everyFunc) ? obj : def;
  };

  return cModel;
});
