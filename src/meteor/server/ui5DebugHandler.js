/**
 * Special handler for allowing user to debug their UI5 app under meteor
 *
 * We provide this as a convience to user so that when they run their UI5 app
 * with the UI5 debug option on it won't fail.  The reason we need this is that
 * UI5 handles the debug option as follows:
 *
 * 1) Request version of the javascript file with '-dbg' in the file name
 * 2) If that 404's, then request the file with the regular filename.
 *
 * Meteor however maddeningly returns a 200 for any 'file not found' request
 * even for public folder assets and it returns the contents of the
 * meteor-generated main html file.  UI5 then tries to load this as a
 * javascript file and fails.
 *
 * Our handler below, intercepts any request for the 'webapp' public folder and
 * if the file name contains '-dbg' and ends in '.js', checks to see if it
 * exists. If it doesn't we return a 404 for UI5 to handle.
 *
 * NOTE: this handler has nothing to do with the models and controls in this
 * package.  Our package provides both minified sources and unminified sources
 * with '-dbg' in the file name and should therefore never generate a 404.
 *
 * TODO: This handler assumes the user is building their UI5 app in the
 * public/webapp folder.  This isn't ideal and longer term I'd like to provide
 * a more dynamic way of building UI5 apps anyway.
 */
import { WebApp } from 'meteor/webapp';
import fs from 'fs';

/* global __meteor_bootstrap__ */


// Get file system path to public folder
const publicFolderPath = `${__meteor_bootstrap__.serverDir}/../web.browser/app`;
const ui5appFolder = '/webapp/';

// Connect handlers for main webapp folder
WebApp.connectHandlers.use(ui5appFolder, (req, res, next) => {
  const containsDbg = (req.url.indexOf('-dbg') > -1);
  const isJavaScript = req.url.endsWith('.js');
  if (containsDbg && isJavaScript) {
    // See if file exists
    const filePath = publicFolderPath + ui5appFolder + req.url;
    try {
      fs.accessSync(filePath, fs.F_OK);

      // If we get here, file exists so let meteor serve it
      next();
    } catch (e) {
      // It isn't accessible, return 404
      res.writeHead(404);
      res.end();
    }
  } else {
    // Not handled by us - pass request to next handler
    next();
  }
});
