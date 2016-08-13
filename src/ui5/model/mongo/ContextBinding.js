sap.ui.define([
    'sap/ui/model/ContextBinding',
    'sap/ui/model/ChangeReason'
  ],
  function(ContextBinding, ChangeReason) {
    "use strict";

    /**
     * Constructor for ContextBinding
     *
     * @class
     * Provides a specialized context binding that can be used to bind to a single
     * document in a Meteor Mongo Collection.  Each instance of this class
     * observes changes on a query handle to provide reactive updates via firing
     * events.
     *
     * @param {meteor-ui5.model.mongo.Model} oModel
     * @param {String} sPath
     * @param {Object} oContext
     * @param {Object} [mParameters]
     * @public
     * @alias meteor-ui5.model.mongo.ContextBinding
     * @extends sap.ui.model.ContextBinding
     */
    var cContextBinding = ContextBinding.extend("meteor-ui5.model.mongo.ContextBinding",  {

      constructor: function(oModel, sPath, oContext, mParameters, oEvents) {
        // Call super constructor
        ContextBinding.call(this, oModel, sPath, oContext, mParameters, oEvents);

        // Execute query.  Although, for reasons I don't understand yet, UI5 is
        // able to get the property values for this context without running a query,
        // We need to do so so we can observe changes and reactively update the
        // data in the front end
        this._runQuery();

        // Don't know what this does but it's needed - copied from ClientModel.js
        var that = this;
        oModel.createBindingContext(sPath, oContext, mParameters, function(oContext) {
          that.bInitial = false;
          that.oElementContext = oContext;
        });
      }
    });

    cContextBinding.prototype.destroy = function() {
      // Stop observing changes in any existing query.  Will run forever otherwise.
      if (this._oQueryHandle) {
        this._oQueryHandle.stop();
      }
    };

    cContextBinding.prototype._runQuery = function() {
      // Stop observing changes in any existing query.  Will run forever otherwise.
      if (this._oQueryHandle) {
        this._oQueryHandle.stop();
      }

      // Run query
      const oCursor = this.oModel.runQuery(this.sPath, this.oContext);

      // Create query handle so we can observe changes
      this._oQueryHandle = oCursor.observeChanges({
        addedBefore: (id, fields, before) => {
          this.fireDataReceived();
          this._fireChange(ChangeReason.add);
        },

        changed: (id, fields) => {
          this._fireChange(ChangeReason.change);
        },

        removed: (id) => {
          this._fireChange(ChangeReason.remove);
        }
      });
    }


    /**
     * @see sap.ui.model.ContextBinding.prototype.refresh
     */
    cContextBinding.prototype.refresh = function(bForceUpdate) {
      var that = this;
      //recreate Context: force update
      this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
        if (that.oElementContext === oContext && !bForceUpdate) {
          that.oModel.checkUpdate(true, oContext);
        } else {
          that.oElementContext = oContext;
          that._fireChange();
        }
      }, true);
    };

    /**
     * @see sap.ui.model.ContextBinding.prototype.refresh
     */
    cContextBinding.prototype.initialize = function() {
      var that = this;
      //recreate Context: force update
      this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
        that.oElementContext = oContext;
        that._fireChange();
      }, true);
    };

    /**
     * @see sap.ui.model.ContextBinding.prototype.setContext
     */
    cContextBinding.prototype.setContext = function(oContext) {
      var that = this;
      if (this.oContext != oContext) {
        this.oContext = oContext;
        this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
          that.oElementContext = oContext;
          that._fireChange();
        });
      }
    };

    return cContextBinding;

  });
