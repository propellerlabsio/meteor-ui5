/**
 * @file package.js
 * @copyright PropellerLabs.io 2016
 * @license Apache-2.0
 *
 * @namespace meteor-ui5
 * @description The Meteor UI5 package
 */

/* globals Package */

Package.describe({
  name: 'propellerlabsio:meteor-ui5',
  version: '0.1.0',
  summary: 'UI5 with Meteor',
  git: 'https://github.com/propellerlabsio/meteor-ui5',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('1.4.0.1');
  api.use('ecmascript');

  // Add package so we can reference Mongo collections by name, imply it
  // so UI5 app builders can do the same.
  api.use('dburles:mongo-collection-instances');
  api.imply('dburles:mongo-collection-instances');

  // Add a convience web app connect handler to allow user to debug their
  // UI5 apps using the normal UI5 debug option as long as they build their apps
  // in the public/webapp folder.
  api.use('webapp', 'server');
  api.addFiles('meteor/server/ui5DebugHandler.js', 'server');

  // Add our model and control files. Note OpenUI5 requires these files to be
  // served as is with none of meteor's mushing which is why we use the bare and
  // isAsset options.
  api.addFiles([
    'model/mongo/ContextBinding.js',
    'model/mongo/ContextBinding-dbg.js',
    'model/mongo/ContextBinding.js.map',
    'model/mongo/DocumentListBinding.js',
    'model/mongo/DocumentListBinding-dbg.js',
    'model/mongo/DocumentListBinding.js.map',
    'model/mongo/Model.js',
    'model/mongo/Model-dbg.js',
    'model/mongo/Model.js.map',
    'model/mongo/PropertyBinding.js',
    'model/mongo/PropertyBinding-dbg.js',
    'model/mongo/PropertyBinding.js.map',
    'model/mongo/PropertyListBinding.js',
    'model/mongo/PropertyListBinding-dbg.js',
    'model/mongo/PropertyListBinding.js.map'
  ], 'client', {
    bare: true,
    isAsset: true // Allows clients to reference model by <resourcepath>.model.mongo.Model
  });
});
