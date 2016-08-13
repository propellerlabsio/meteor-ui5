/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/model/PropertyBinding',
	'sap/ui/model/SimpleType',
	'sap/ui/model/DataState'
], function(jQuery, PropertyBinding, SimpleType, DataState) {
    "use strict";

    /**
     * Constructor for PropertyBinding
     *
     * @class
     * The PropertyBinding is used to access single data values in the data model.
     *
     * @param {sap.ui.model.Model} oModel
     * @param {string} sPath
     * @param {sap.ui.model.Context} oContext
     * @param {object} [mParameters]
     *
     * @public
     * @alias meteor-ui5.model.mongo.PropertyBinding
     * @extends sap.ui.model.Binding
     */

    var cPropertyBinding = PropertyBinding.extend("meteor-ui5.model.mongo.PropertyBinding", /** @lends meteor-ui5.model.mongo.PropertyBinding.prototype */ {

      constructor: function(oModel, sPath, oContext, mParameters) {
				// Call super constructor
        PropertyBinding.apply(this, arguments);
      },

    });

    // the 'abstract methods' to be implemented by child classes
    /**
     * Returns the current value of the bound target
     *
     * @function
     * @name meteor-ui5.model.mongo.PropertyBinding.prototype.getValue
     * @return {object} the current value of the bound target
     *
     * @public
     */
    cPropertyBinding.prototype.getValue = function() {
			return this.oModel.getProperty(this.sPath, this.oContext);
    }

    /**
     * Sets the value for this binding. A model implementation should check if the current default binding mode permits
     * setting the binding value and if so set the new value also in the model.
     *
     * @function
     * @name meteor-ui5.model.mongo.PropertyBinding.prototype.setValue
     * @param {object} oValue the value to set for this binding
     *
     * @public
     */
		 // TODO: Do we need to implement this eventually?  See TODO in
		 // setExternalValue.

    /**
     * Sets the value for this binding. The value is parsed and validated against its type and then set to the binding.
     * A model implementation should check if the current default binding mode permits
     * setting the binding value and if so set the new value also in the model.
		 *
		 * TODO: Do something with this - this was copied from base PropertyBinding
		 * class but we don't support two-way binding.  When we do, we will have to
		 * override this code.  In the mean time we need to change it to throw an
		 * exception.
     *
     * @param {object} oValue the value to set for this binding
     *
     * @throws sap.ui.model.ParseException
     * @throws sap.ui.model.ValidateException
     *
     * @public
     */
    cPropertyBinding.prototype.setExternalValue = function(oValue) {

      // formatter doesn't support two way binding
      if (this.fnFormatter) {
        jQuery.sap.log.warning("Tried to use twoway binding, but a formatter function is used");
        return;
      }

      var oDataState = this.getDataState();
      try {
        if (this.oType) {
          oValue = this.oType.parseValue(oValue, this.sInternalType);
          this.oType.validateValue(oValue);
        }
      } catch (oException) {
        oDataState.setInvalidValue(oValue);
        this.checkDataState(); //data ui state is dirty inform the control
        throw oException;
      }
      // if no type specified set value directly
      oDataState.setInvalidValue(null);
      this.setValue(oValue);
    };

    return cPropertyBinding;

  });
