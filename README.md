# meteor-ui5
This package is a work in progress for using Open UI5 with Meteor.  It contains
a new UI5 MeteorModel for reactively hooking meteor collections and queries to
UI5 controls.

Currently it does not include the OpenUI5 library itself which has to be bootstrapped via a script element in HTML in the normal manner.

WARNING: THIS SOFTWARE IN AN EARLY ALPHA STATE.

## Demo app
Please refer to the Demo app at https://github.com/propellerlabsio/meteor-ui5-demo.git for a working example of the features of this package.

## Useage instructions
1. Add the package to your meteor project with ```meteor add propellerlabsio:meteor-ui5```.
1. (Optional) Remove Blaze
    1. Remove Blaze with ```meteor remove blaze-html-templates```.
    2. Add static-html support with ```meteor add static-html```.
1. Create a folder for your UI5 app in the public folder of the root directory.
    E.g. ```/public/myui5app```.
1. Bootstrap UI5.  
In your apps HTML file, bootstrap UI5 in the manner described
in the OpenUI5 docs.  In your OpenUI5 bootstrap script, add the public folder you
created in the previous step and meteor-ui5 as resource roots.  Do not include the
```/public``` part of your UI5 app folder path E.g.:

  ```
  data-sap-ui-resourceroots='{
    "myui5app": "/myui5app/"
    "meteor-ui5": "/packages/propellerlabsio_meteor-ui5/"
  }
  ```
1. Instantiate a MeteorModel for your UI5 view/controls.  You can reference MeteorModel in any ```sap.ui.define``` method via the resource root you configured in the previous step and ```/MeteorModel```).  E.g.:

  ```
  sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "meteor-ui5/MeteorModel"
    ],
    function(Controller, MessageToast, MeteorModel) {
  ```
  Instantiate a new meteor model by passing it:
  * a Meteor subscription name (autopublish is not supported)
  * a Meteor cursor (query).
  * (Optionally) a Meteor Collection object if you wish to use two-way data binding.  

  E.g.:

  ```
  // Build and set Meteor model from meteor subscription and cursor on
  // collection people
  var sSubscription = "people";
  var oCursor = people.find();
  var oPeople = new MeteorModel(sSubscription, oCursor, people);
  this.getView().setModel(oPeople, "people");
  ```

## TODO
* Document difference between and how to use / implement two-way data binding vs
one-way data binding.
* Include OpenUI5 itself in package.
* Handle caching - updates to assets (xml, js) in client app (ie user of package) are currently cached by browser making development a PITA and deployment of new versions problematic.  In the interim, I'm using Cache Killer for development: https://chrome.google.com/webstore/detail/cache-killer/jpfbieopdmepaolggioebjmedmclkbap
* Performance-optimizations in Meteor cursor observeChanges - only update, add and remove changed documents.
* Destroy cursor queryHandle on destroy of UI5 model

## License
This software is licensed under the Apache License, Version 2.0 - see LICENSE.txt
