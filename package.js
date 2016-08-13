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

  // Add package so we can reference Mongo collections by name, imply it
  // so UI5 app builders can do the same.
  api.use('dburles:mongo-collection-instances');
  api.imply('dburles:mongo-collection-instances');

  // Set up proxy server to serve our UI5 model files.  UI5
  // unfortunately usually requires/uses filesystem paths and has
  // special handling that isn't otherwise compatible with the meteor way of
  // doing things.
  api.use('webapp', 'server');
  api.addFiles('src/meteor/server/proxy.js', 'server');

  // Add our model and control files. Note these files must be served as is
  // with none of meteor's mushing.
  // TODO convert paths to dist instead of source when our build process is
  // added.
  api.addFiles([
    // Meteor-ui5 project files
    'src/ui5/model/mongo/ContextBinding.js',
    'src/ui5/model/mongo/DocumentListBinding.js',
    'src/ui5/model/mongo/Model.js',
    'src/ui5/model/mongo/PropertyBinding.js',
    'src/ui5/model/mongo/PropertyListBinding.js'
  ], 'client', {
    bare: true,
    isAsset: true // Allows clients to reference model by <resourcepath>.model.mongo.Model
  });


});
