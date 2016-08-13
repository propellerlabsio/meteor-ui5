'use strict';

/*!

 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ListBinding', 'sap/ui/model/Context', 'sap/ui/model/ChangeReason'], function (jQuery, ListBinding, Context, ChangeReason) {
  "use strict";

  /**
   * Constructor for PropertyListBinding
   *
   * @class
   * The PropertyListBinding is a specific binding for lists in the model, which can be used
   * to populate Tables or ItemLists.
   *
   * @param {sap.ui.model.Model} oModel
   * @param {string} sPath
   * @param {sap.ui.model.Context} oContext
   * @param {array} [aSorters] initial sort order (can be either a sorter or an array of sorters)
   * @param {array} [aFilters] predefined filter/s (can be either a filter or an array of filters)
   * @param {object} [mParameters]
   *
   * @public
   * @alias meteor-ui5.model.mongo.PropertyListBinding
   * @extends sap.ui.model.Binding
   */

  var cPropertyListBinding = ListBinding.extend("meteor-ui5.model.mongo.PropertyListBinding", {

    constructor: function constructor(oModel, sPath, oContext, aSorters, aFilters, mParameters) {

      ListBinding.call(this, oModel, sPath, oContext, aSorters, aFilters, mParameters);

      // Set up array for storing contexts
      this._aContexts = [];

      // Build and run query
      this._runQuery();
    }

  });

  cPropertyListBinding.prototype._runQuery = function () {
    var _this = this;

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
      addedBefore: function addedBefore(id, fields, before) {
        _this.fireDataReceived();
        _this._fireChange(ChangeReason.add);
      },

      changed: function changed(id, fields) {
        //TODO performance - work out how to only update data that has changed
        _this.oModel.refresh();
      },

      removed: function removed(id) {
        //TODO performance - work out how to only update data that has changed
        _this.oModel.refresh();
      }
    });
  };

  /**
   * Returns an array of binding contexts for the bound target list.
   *
   * <strong>Note:</strong>The public usage of this method is deprecated, as calls from outside of controls will lead
   * to unexpected side effects. For avoidance use {@link meteor-ui5.model.mongo.PropertyListBinding.prototype.getCurrentContexts}
   * instead.
   *
   * @function
   * @name meteor-ui5.model.mongo.PropertyListBinding.prototype.getContexts
   * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
   * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
   * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
   *
   * @protected
   */
  cPropertyListBinding.prototype.getContexts = function (iStartIndex, iLength) {
    var _this2 = this;

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
      aProperty.forEach(function (value, index) {
        // Create context
        var sPath = _this2.oContext.sPath + "/" + _this2.sPath + "[" + index + "]";
        var oContext = new Context(_this2.oModel, sPath);
        _this2._aContexts.push(oContext);
      });
    }

    var iStart = iStartIndex === undefined ? 0 : iStartIndex;
    var iLen = iLength === undefined ? this.oModel.iSizeLimit - iStart : iLength;
    return this._aContexts.slice(iStart).splice(0, iLen);
  };

  cPropertyListBinding.prototype.destroy = function () {
    // Call stop on queryHandle on destroy of meteor model per docs:
    // "observeChanges returns a live query handle, which is an object with a
    // stop method. Call stop with no arguments to stop calling the callback functions
    // and tear down the query. The query will run forever until you call this. "
    if (this._oQueryHandle) {
      this._oQueryHandle.stop();
    }
  };

  /**
   * Filters the list according to the filter definitions
   *
   * @function
   * @name meteor-ui5.model.mongo.PropertyListBinding.prototype.filter
   * @param {object[]} aFilters Array of filter objects
   * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
   * @return {meteor-ui5.model.mongo.PropertyListBinding} returns <code>this</code> to facilitate method chaining
   *
   * @public
   */
  cPropertyListBinding.prototype.filter = function (aFilters, sFilterType) {
    // Replace contents of aFilters property
    this.aApplicationFilters = aFilters;

    // Re-run query
    this._runQuery();
  };

  /**
   * Sorts the list according to the sorter object
   *
   * @function
   * @name meteor-ui5.model.mongo.PropertyListBinding.prototype.sort
   * @param {sap.ui.model.Sorter|Array} aSorters the Sorter object or an array of sorters which defines the sort order
   * @return {meteor-ui5.model.mongo.PropertyListBinding} returns <code>this</code> to facilitate method chaining
   * @public
   */
  cPropertyListBinding.prototype.sort = function (aSorters) {
    // Replace contents of aSorters property
    Array.isArray(aSorters) ? this.aSorters = aSorters : this.aSorters = [aSorters];

    // Re-run query
    this._runQuery();
  };

  /**
   * Returns an array of currently used binding contexts of the bound control
   *
   * This method does not trigger any data requests from the backend or delta calculation, but just returns the context
   * array as last requested by the control. This can be used by the application to get access to the data currently
   * displayed by a list control.
   *
   * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
   * @since 1.28
   * @public
   */
  cPropertyListBinding.prototype.getCurrentContexts = function () {
    return this._aContexts;
  };

  /**
   * Returns the number of entries in the list. This might be an estimated or preliminary length, in case
   * the full length is not known yet, see method isLengthFinal().
   *
   * @return {int} returns the number of entries in the list
   * @since 1.24
   * @public
   */
  cPropertyListBinding.prototype.getLength = function () {
    return this._aContexts.length;
  };

  /**
   * Returns whether the length which can be retrieved using getLength() is a known, final length,
   * or an preliminary or estimated length which may change if further data is requested.
   *
   * @return {boolean} returns whether the length is final
   * @since 1.24
   * @public
   */
  cPropertyListBinding.prototype.isLengthFinal = function () {
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
   * Returns list of distinct values for the given relative binding path
   *
   * @param {string} sPath the relative binding path
   * @return {Array} the array of distinct values.
   *
   * @public
   */
  cPropertyListBinding.prototype.getDistinctValues = function (sPath) {
    // TODO what's supposed to go here?
    return null;
  };

  /**
   * Enable extended change detection
   *
   * @param {boolean} bDetectUpdates Whether changes within the same entity should cause a delete and insert command
   * @param {function|string} vKey The path of the property containing the key or a function getting the context as only parameter to calculate a key to identify an entry
   * @private
   */
  cPropertyListBinding.prototype.enableExtendedChangeDetection = function (bDetectUpdates, vKey) {

    // TODO: BELOW CODE HAS BEEN COPIED VERBATIM FROM 'sap/ui/model/ListBinding'
    // DON'T KNOW HOW IT WORKS AND WHAT IT IS SUPPOSED TO DO SO HOISTING INTO THIS CLASS
    // TO OBSERVE IT. REPLACE OR DELETE IT WHEN ITS UNDERSTOOD

    this.bUseExtendedChangeDetection = true;
    this.bDetectUpdates = bDetectUpdates;
    if (typeof vKey === "string") {
      this.fnGetEntryKey = function (oContext) {
        return oContext.getProperty(vKey);
      };
    } else if (typeof vKey === "function") {
      this.fnGetEntryKey = vKey;
    }
    if (this.update) {
      this.update();
    }
  };

  return cPropertyListBinding;
});
//# sourceMappingURL=PropertyListBinding.js.map
