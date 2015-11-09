# meteor-ui5
This package is a work in progress for using Open UI5 with Meteor.  It contains
a new UI5 MeteorModel for reactively hooking meteor collections and queries to
UI5 controls.

Currently it does not include the OpenUI5 library itself which has to be bootstrapped
via a script in HTML in the normal manner.

WARNING: THIS SOFTWARE IS IN A VERY EARLY ALPHA STATE.  PLEASE DO NOT USE IT FOR
PRODUCTION PURPOSES.

# Instructions
1. Clone this repo to the ```packages``` folder in your meteor project.
2. Add the package with ```meteor add propellerlabsio:meteor-ui5```.
3. In your OpenUI5 bootstrap script, add meteor-ui5 as a resource root:
  ```
  data-sap-ui-resourceroots='{
    ...
    "meteor-ui5": "/packages/propellerlabsio_meteor-ui5/"
    ...
  }
  ```
4. Reference MeteorModel in any ```sap.ui.define``` as ```meteor-ui5/MeteorModel```.  E.g.:
```
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "meteor-ui5/MeteorModel"
    ],
    function(Controller, MessageToast, MeteorModel) {
```
5. Instantiate a new meteor model by passing it a subscription and a cursor (query).  E.g.:
  ```
  // Build and set Meteor model from meteor subscription and cursor
  var sSubscription = "people";
  var oCursor = people.find();
  var oPeople = new MeteorModel(sSubscription,oCursor);
  this.getView().setModel(oPeople, "people");
  ```
# TODO
* Include OpenUI5 itself in package.
* Two-way binding (update meteor collection from UI5 control changes)
* Performance-optimizations in Meteor cursor observeChanges - only update, add and remove changed documents.
* Destroy cursor queryHandle on destroy of UI5 model
* Create meteor package for extension
