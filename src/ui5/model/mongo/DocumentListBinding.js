sap.ui.define([
  'jquery.sap.global',
  'sap/ui/model/ListBinding',
  'sap/ui/model/Context',
  'sap/ui/model/ChangeReason',
  'sap/ui/model/Filter'
], function(jQuery, ListBinding, Context, ChangeReason, Filter) {
  "use strict";

  /**
   * @summary Constructor for DocumentListBinding
   *
   * @class
   * @description Provides a specialized context binding that can be used to
   * bind to several documents in a Meteor Mongo Collection.  It is this type
   * of ContextBinding that is used when, for example, an object header is
   * bound to a path like "/Orders".  The results can be restricted via the
   * aFilters parameter.
   *
   * Each instance of this class observes changes on a query handle to provide
   * reactive updates via firing events.
   *
   * @param {meteor-ui5.model.mongo.Model} oModel
   * @param {string} sPath
   * @param {sap.ui.model.Context} oContext
   * @param {array} [aSorters] initial sort order (can be either a sorter or an array of sorters)
   * @param {array} [aFilters] predefined filter/s (can be either a filter or an array of filters)
   * @param {object} [mParameters]
   *
   * @public
   * @alias meteor-ui5.model.mongo.DocumentListBinding
   * @extends sap.ui.model.ListBinding
   */
  var cDocumentListBinding = ListBinding.extend("meteor-ui5.model.mongo.DocumentListBinding", {

    constructor: function(oModel, sPath, oContext, aSorters, aFilters, mParameters) {

      ListBinding.call(this, oModel, sPath, oContext, aSorters, aFilters, mParameters);

      // Set up array for storing contexts
      this._aContexts = [];

      // Build and run query
      this._runQuery();
    }

  });


  /**
   * @summary Returns an array of binding contexts for the bound target list.
   *
   * @description <strong>Note:</strong>The parent class method documentation
   * indicates tht public usage of this method is deprecated use {@link meteor-ui5.model.mongo.DocumentListBinding.prototype.getCurrentContexts}
   * instead.
   *
   * @function
   * @name meteor-ui5.model.mongo.DocumentListBinding.prototype.getContexts
   * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
   * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
   * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
   *
   * @protected
   */
  cDocumentListBinding.prototype.getContexts = function(iStartIndex, iLength) {
    // TODO Optimize the interplay between this method and the observeChanges.added
    // code added to the query.  It's exponentially better than it was but is still
    // being called every time dataChange is fired so if the query results
    // in say 830 records, then it is called 830 times returning 0..830 records.
    // NOTE above does not seem to impact performace with local testing of 830
    // records so may be a low priority issue or no issue at all.
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
  cDocumentListBinding.prototype.destroy = function() {
    // Call stop on queryHandle on destroy of meteor model per docs:
    // "observeChanges returns a live query handle, which is an object with a
    // stop method. Call stop with no arguments to stop calling the callback functions
    // and tear down the query. The query will run forever until you call this. "
    if (this._oQueryHandle) {
      this._oQueryHandle.stop();
    }
  };

  /**
   * @summary Filters the list according to the filter definitions
   *
   * @function
   * @param {object[]} aFilters Array of filter objects
   * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
   * @return {meteor-ui5.model.mongo.DocumentListBinding} returns <code>this</code> to facilitate method chaining
   *
   * @public
   */
  cDocumentListBinding.prototype.filter = function(aFilters, sFilterType) {
    // Replace contents of aFilters property
    this.aFilters = [];
    if (!jQuery.isArray(aFilters) && aFilters instanceof Filter) {
      aFilters = [aFilters];
    } else if (!jQuery.isArray(aFilters)) {
      aFilters = [];
    }
    this.aApplicationFilters = aFilters;

    // Re-run query
    this._runQuery();

    return this;
  };

  /**
   * Sorts the list according to the sorter object
   *
   * @function
   * @param {sap.ui.model.Sorter|Array} aSorters the Sorter object or an array of sorters which defines the sort order
   * @return {meteor-ui5.model.mongo.DocumentListBinding} returns <code>this</code> to facilitate method chaining
   * @public
   */
  cDocumentListBinding.prototype.sort = function(aSorters) {
    // Replace contents of aSorters property
    Array.isArray(aSorters) ? this.aSorters = aSorters : this.aSorters = [aSorters];

    // Re-run query
    this._runQuery();

    return this;
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
  cDocumentListBinding.prototype.getLength = function() {
    return this._aContexts.length;
  };

  /**
   * @summary Returns whether the length of the list is final
   *
   * @description Returns whether the length which can be retrieved using getLength()
   * is a known, final length, or an preliminary or estimated length which may
   * change if further data is requested.
   *
   * @return {boolean} returns whether the length is final
   * @public
   */
  cDocumentListBinding.prototype.isLengthFinal = function() {
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
  cDocumentListBinding.prototype.getDistinctValues = function(sPath) {
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
  cDocumentListBinding.prototype.enableExtendedChangeDetection = function(bDetectUpdates, vKey) {

    // TODO: BELOW CODE HAS BEEN COPIED VERBATIM FROM 'sap/ui/model/ListBinding'
    // DON'T KNOW HOW IT WORKS AND WHAT IT IS SUPPOSED TO DO SO HOISTING INTO THIS CLASS
    // TO OBSERVE IT. REPLACE OR DELETE IT WHEN ITS UNDERSTOOD

    this.bUseExtendedChangeDetection = true;
    this.bDetectUpdates = bDetectUpdates;
    if (typeof vKey === "string") {
      this.fnGetEntryKey = function(oContext) {
        return oContext.getProperty(vKey);
      };
    } else if (typeof vKey === "function") {
      this.fnGetEntryKey = vKey;
    }
    if (this.update) {
      this.update();
    }
  };

  /**
   * @summary Execute Mongo query for current path and context and observe changes.
   *
   * @description This method runs the query for this context binding and provides
   * reactivity by observing changes in the query and firing events on change.
   * @private
   */
  cDocumentListBinding.prototype._runQuery = function() {
    // Stop observing changes in any existing query.  Will run forever otherwise.
    if (this._oQueryHandle) {
      this._oQueryHandle.stop();
    }

    // Reset existing contexts
    this._aContexts = [];
    this._fireChange(ChangeReason.remove);

    // Run query
    const oCursor = this.oModel.runQuery(this.sPath, this.oContext, this.aSorters, this.aApplicationFilters);

    // Create query handle so we can observe changes
    // var that = this;
    this._oQueryHandle = oCursor.observeChanges({
      addedBefore: (id, fields, before) => {
        const oContext = new Context(this.oModel, this.sPath + "(" + id + ")");
        this._aContexts.push(oContext);
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

  return cDocumentListBinding;

});
