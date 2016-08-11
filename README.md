# meteor-ui5
This package is a work in progress for using UI5 with Meteor.  It contains
a new UI5 model for reactively binding meteor collections and queries to
UI5 controls.

It does not include the OpenUI5 library itself which has to be bootstrapped via a script element in HTML in the normal manner.

**WARNING: THIS SOFTWARE IN AN EARLY ALPHA STATE.**

## Demos and docs
Please see the [Meteor Ui5 website at PropellerLabs.io](http://meteor-ui5.propellerlabs.io) for documentation and working examples of all of the features of this package.  

## Quickstart
1. Add the package to your meteor project with ```meteor add propellerlabsio:meteor-ui5```.
1. Remove Blaze
    1. Remove Blaze with `meteor remove blaze-html-templates`.
    2. Add static-html support with `meteor add static-html`.
1. Create a folder called `webapp` for your UI5 app in the public folder of the root directory.
    I.e. `/public/webapp`.
1. Bootstrap UI5.  
In your app's HTML file, bootstrap UI5 in the manner [described in the OpenUI5 docs](http://openui5.org/getstarted.html#step1).  In your OpenUI5 bootstrap script, add the public folder you created in the previous step and meteor-ui5 as resource roots.  Do not include the `/public` part of your UI5 app folder path:
```json
data-sap-ui-resourceroots='{
  "myui5app": "/webapp/"
  "meteor-ui5": "/packages/propellerlabsio_meteor-ui5/"
}
```
1. Instantiate a meteor model for your UI5 views/controls.  You can reference any `meteor-ui5` component in any `sap.ui.define` like this:
```
sap.ui.define(
  [
      "sap/ui/core/mvc/Controller",
      "sap/m/MessageToast",
      "meteor-ui5/model/mongo/Model"
  ],
  function(Controller, MessageToast, MeteorModel) {
```

1. Access data from your meteor mongo collections. E.g:
  1. Controler code:
```js
    onInit: function() {
      // Create Meteor model
      var oModel = new MeteorModel();
      this.getView().setModel(oModel);
    },
```
  2. View code:
```xml
    <!-- List all orders in mongo collection Orders -->
    <Table id="OrdersTable" items="{/Orders}">
        <!-- Define your columns here -->
    <Table>
```

## Roadmap

This is the roadmap for the `meteor-ui5` package:

### v0.1 - This version currently under construction

1. Clean up & complete jsdoc comments in all code.
1. Add license files and headers.

### v0.2+

1. Add multifilter support (where single filter object is itself an array of filters with and/or conditions defined between them).
1. Filtering/sorting on list binding to array properties of single documents.
1. Add support for two-way binding (requires allow write to collections - not Meteor best practice which is update via method).
1. Add support for paging.  UI5 instantiates multiple control objects for every record in a list.  Need to limit the amount of front-end memory consumed when paging through large lists.
1. Incorporate UI5 webapp into meteor build process.
1. Build Meteor UI5 version of accounts-ui for integration with unified shell.

### Maybe

1. Add TreeBinding model

## License
This software is licensed under the Apache License, Version 2.0 - see LICENSE.txt
