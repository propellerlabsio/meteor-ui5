# meteor-ui5
This package is a work in progress for using Open UI5 with Meteor.  Apart from
including the OpenUI5 libraries, it contains a new UI5 MeteorModel for reactively
hooking meteor collections and queries to UI5 controls.
# TODO
* Two-way binding (update meteor collection from UI5 control changes)
* Performance-optimizations in Meteor cursor observeChanges - only update, add and remove changed documents.
* Destroy cursor queryHandle on destroy of UI5 model
* Create meteor package for extension
