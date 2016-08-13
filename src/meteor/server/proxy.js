// Special web handlers for stuff in our public /webapp/ folder.  We need these
// to circumvent Meteor's behaviour of returning the Meteor-built
// conglomerated index.html file for every request that doesn't fit within the
// Meteor way of doing things.

import fs from 'fs';

const PACKAGE_PATH = '/packages/propellerlabsio_meteor-ui5';
const REDIRECT_PREFIX = 'src/ui5/'; // TODO: convert to dist when build system is implemented.

// Connect handlers for ui5 model and controls
WebApp.connectHandlers.use(PACKAGE_PATH, function(req, res, next) {
  let redirectURL;

  // Take request for "/model/mongo/Model.js" and redirect it to
  // "/src/ui5/model/mongo/Model.js"
  // TODO adjust when build system implemented
  if (req.url.indexOf(REDIRECT_PREFIX) < 0) {
    redirectURL = PACKAGE_PATH + '/src/ui5/' + req.url;

    // Remove "-dbg" from file path and just serve regular file
    // TODO revisit when build system implemented
    redirectURL = redirectURL.replace("-dbg", "");
  }

  // Redirect if we have determined we should
  if (redirectURL) {
    res.writeHead(301, {
      Location: redirectURL
    });
    res.end();
  } else {
    // Not handled by us - pass request to next handler
    next();
  }

});
