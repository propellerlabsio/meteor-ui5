/**
 * The Meteor UI5 package
 *
 * @namespace meteor-ui5
 *
 */
Package.describe({
  name: 'propellerlabsio:meteor-ui5',
  version: '0.1.0',
  summary: 'UI5 with Meteor',
  git: 'https://github.com/propellerlabsio/meteor-ui5',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.0.1');
  api.use('ecmascript');
  api.addFiles([
    // Meteor-ui5 project files
    'model/mongo/ContextBinding.js',
    'model/mongo/DocumentListBinding.js',
    'model/mongo/Model.js',
    'model/mongo/PropertyBinding.js',
    'model/mongo/PropertyListBinding.js'
  ], 'client', {
    bare: true,
    isAsset: true     // Allows clients to reference model by <resourcepath>.model.mongo.Model
  });

});
