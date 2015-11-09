Package.describe({
  name: 'propellerlabsio:meteor-ui5',
  version: '0.0.1',
  summary: 'OpenUI5 in Meteor',
  git: 'https://github.com/propellerlabsio/meteor-ui5',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.addFiles([
      // Meteor-ui5 project files
      'MeteorModel.js',
  ], 'client', {isAsset: true});

});
