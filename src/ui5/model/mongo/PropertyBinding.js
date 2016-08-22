/**
 * @file meteor-ui5.model.mongo.PropertyBinding.js
 * @copyright PropellerLabs.io 2016
 * @license Apache-2.0
 */
/* globals sap */
sap.ui.define([
  'jquery.sap.global',
  'sap/ui/model/PropertyBinding',
], (jQuery, PropertyBinding) => {
  /**
   * @summary Constructor for PropertyBinding
   *
   * @class
   * @description The PropertyBinding is used to access single data values in
   * the data model.
   *
   * @param {meteor-ui5.model.mongo.Model} oModel
   * @param {string} sPath
   * @param {sap.ui.model.Context} oContext
   * @param {object} [mParameters]
   *
   * @public
   * @alias meteor-ui5.model.mongo.PropertyBinding
   * @extends sap.ui.model.PropertyBinding
   */
  const cPropertyBinding = PropertyBinding.extend('meteor-ui5.model.mongo.PropertyBinding', {

    constructor(oModel, sPath, oContext, mParameters) {
      // Call super constructor
      PropertyBinding.apply(this, oModel, sPath, oContext, mParameters);
    },

  });

  /**
   * Returns the current value of the bound target
   *
   * @return {object} the current value of the bound target
   *
   * @public
   */
  cPropertyBinding.prototype.getValue = function getValue() {
    return this.oModel.getProperty(this.sPath, this.oContext);
  };

  /**
   * Sets the value for this binding. A model implementation should check if the
   * current default binding mode permits setting the binding value and if so set
   * the new value also in the model.
   *
   * @param {object} oValue the value to set for this binding
   *
   * @public
   */
  // TODO: Implement when we support two-way data binding (future version)


  return cPropertyBinding;
});
