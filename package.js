Package.describe({
  name: 'propellerlabsio:meteor-ui5',
  version: '0.0.2',
  summary: 'DEPRECATED! See README.',
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
