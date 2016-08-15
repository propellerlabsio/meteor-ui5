/**
 * @file meteor-ui5.model.mongo.PropertyListBinding.js
 * @copyright PropellerLabs.io 2016
 * @license Apache-2.0
 */
sap.ui.define([
  'jquery.sap.global',
  'sap/ui/model/ListBinding',
  'sap/ui/model/Context',
  'sap/ui/model/ChangeReason'
], function(jQuery, ListBinding, Context, ChangeReason) {
  "use strict";

  /**
   * @summary Constructor for PropertyListBinding
   *
   * @class
   * @description Provides a specialized context binding that can be used to
   * bind to a Mongo document property that is an array .
   *
   * Note: Sorting and filtering have not been implemented yet (v0.1).  This is
   * planned for (v0.2).
   *
   * @param {meteor-ui5.model.mongo.Model} oModel
   * @param {string} sPath
   * @param {sap.ui.model.Context} oContext
   * @param {array} [aSorters] Not supported yet
   * @param {array} [aFilters] Not supported yet
   * @param {object} [mParameters]
   *
   * @public
   * @alias meteor-ui5.model.mongo.PropertyListBinding
   * @extends sap.ui.model.ListBinding
   */
  var cPropertyListBinding = ListBinding.extend("meteor-ui5.model.mongo.PropertyListBinding", {

    constructor: function(oModel, sPath, oContext, aSorters, aFilters, mParameters) {

      ListBinding.call(this, oModel, sPath, oContext, aSorters, aFilters, mParameters);

      // Set up array for storing contexts
      this._aContexts = [];

      // Validate filtering and sorting hasn't been requested - not supported yet.
      if (this.aSorters.length || this.aApplicationFilters.length) {
        const sError = "Sorting and filtering not supported yet for binding to arrays.";
        jQuery.sap.log.fatal(sError);
        this.fireRequestFailed({
          message: sError
        });
        return;
      }

      // Build and run query
      this._runQuery();
    }

  });

  /**
   * @summary Execute Mongo query for current path and context and observe changes.
   *
   * @description This method runs the query for this context binding and provides
   * reactivity by observing changes in the query and firing events on change.
   * @private
   */
  cPropertyListBinding.prototype._runQuery = function() {
    // Stop observing changes in any existing query.  Will run forever otherwise.
    if (this._oQueryHandle) {
      this._oQueryHandle.stop();
    }

    // Reset existing contexts
    this._aContexts = [];
    this._fireChange(ChangeReason.remove);

    // Run query for context.
    this._oCursor = this.oModel.runQuery(this.sPath, this.oContext, this.aSorters, this.aApplicationFilters);

    // Create query handle so we can observe changes
    // var that = this;
    this._oQueryHandle = this._oCursor.observeChanges({
      addedBefore: (id, fields, before) => {
        this.fireDataReceived();
        this._fireChange(ChangeReason.add);
      },

      changed: (id, fields) => {
        //TODO performance - work out how to only update data that has changed
        this.oModel.refresh();
      },

      removed: (id) => {
        //TODO performance - work out how to only update data that has changed
        this.oModel.refresh();
      }
    });
  }

  /**
   * Returns an array of binding contexts for the bound target list.
   *
   * @description <strong>Note:</strong>The parent class method documentation
   * indicates tht public usage of this method is deprecated use {@link meteor-ui5.model.mongo.PropertyListBinding.prototype.getCurrentContexts}
   * instead.
   *
   * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
   * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
   * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
   *
   * @protected
   */
  cPropertyListBinding.prototype.getContexts = function(iStartIndex, iLength) {

    // Get document containing property.  We used find instead of findOne to
    // produce the cursor even though we will only ever get one document
    // so that we can observeChanges on it.  Just get the first (only) document
    // from the query handle.
    this._aContexts = [];
    var oDocument = this._oCursor.fetch()[0];
    var aProperty = _.get(oDocument, this.sPath);
    if (!Array.isArray(aProperty)) {
      //TODO use standard UI5 error handling here
      console.error(this.sPath + " is not an array.");
    } else {
      aProperty.forEach((value, index) => {
        // Create context
        var sPath = this.oContext.sPath + "/" + this.sPath + "[" + index + "]"
        const oContext = new Context(this.oModel, sPath);
        this._aContexts.push(oContext);
      })
    }


    const iStart = iStartIndex === undefined ? 0 : iStartIndex;
    const iLen = iLength === undefined ? this.oModel.iSizeLimit - iStart : iLength;
    return this._aContexts.slice(iStart).splice(0, iLen);
  };

  /**
   * @summary Clean-up no longer needed resources when this context binding is
   * destroyed.
   *
   * @description Stop observing changes in the existing query or it will run
   * forever.
   * @public
   */
  cPropertyListBinding.prototype.destroy = function() {
    if (this._oQueryHandle) {
      this._oQueryHandle.stop();
    }
  };

  /**
   * @summary Filters the list according to the filter definitions
   *
   * @description <strong>Note:</strong>Support this feature has not been
   * implemented yet in this model.
   *
   * @param {object[]} aFilters Array of filter objects
   * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
   * @return {meteor-ui5.model.mongo.PropertyListBinding} returns <code>this</code> to facilitate method chaining
   *
   * @public
   */
  cPropertyListBinding.prototype.filter = function(aFilters, sFilterType) {
    const sError = "Sorting and filtering not supported yet for binding to arrays.";
    jQuery.sap.log.fatal(sError);
    this.fireRequestFailed({
      message: sError
    });
    return this;
  };

  /**
   * @summary Sorts the list according to the sorter object
   *
   * @description <strong>Note:</strong>Support this feature has not been
   * implemented yet in this model.
   *
   * @param {sap.ui.model.Sorter|Array} aSorters the Sorter object or an array of sorters which defines the sort order
   * @return {meteor-ui5.model.mongo.PropertyListBinding} returns <code>this</code> to facilitate method chaining
   * @public
   */
  cPropertyListBinding.prototype.sort = function(aSorters) {
    const sError = "Sorting and filtering not supported yet for binding to arrays.";
    jQuery.sap.log.fatal(sError);
    this.fireRequestFailed({
      message: sError
    });
    return this;
  };

  /**
   * Returns an array of currently used binding contexts of the bound control
   *
   * This method does not trigger any data requests from the backend or delta calculation, but just returns the context
   * array as last requested by the control. This can be used by the application to get access to the data currently
   * displayed by a list control.
   *
   * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
   * @public
   */
  cPropertyListBinding.prototype.getCurrentContexts = function() {
    return this._aContexts;
  };

  /**
   * @summary Returns the number of entries in the list.
   *
   * @description This might be an estimated or preliminary length, in case
   * the full length is not known yet, see method isLengthFinal().
   *
   * @return {int} returns the number of entries in the list
   * @public
   */
  cPropertyListBinding.prototype.getLength = function() {
    return this._aContexts.length;
  };

  /**
   * @summary Returns whether the length of the list is final
   *
   * @description Returns whether the length which can be retrieved using getLength()
   * is a known, final length, or an preliminary or estimated length which may
   * change if further data is requested.
   *
   * <strong>Note:</strong>Support this feature has not been implemented yet in
   * this model.
   *
   * @return {boolean} returns whether the length is final
   * @public
   */
  cPropertyListBinding.prototype.isLengthFinal = function() {
    // TODO don't know what to do here yet.  Can't get this method
    // to trigger and in any case, the only way to calculate if queryHandle.count()
    // is final is to introduce subscriptions to the model which I've been
    // keen to avoid as it will complicate the hell out of things whereas
    // having it outside of the model is quite simple.  There's a discussion
    // on the issue here:
    // http://stackoverflow.com/questions/18744665/how-to-get-a-published-collections-total-count-regardless-of-a-specified-limit
    // In the mean time return false;
    return false;
  };

  /**
   * @summary Returns list of distinct values for the given relative binding path
   *
   * @description <strong>Note:</strong>Support this feature has not been implemented
   * yet in this model.
   *
   * @param {string} sPath the relative binding path
   * @return {Array} the array of distinct values.
   *
   * @public
   */
  cPropertyListBinding.prototype.getDistinctValues = function(sPath) {
    // TODO what's supposed to go here?
    return null;
  };

  return cPropertyListBinding;

});
