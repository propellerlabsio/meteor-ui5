"use strict";sap.ui.define(["jquery.sap.global","sap/ui/model/Model","sap/ui/model/BindingMode","sap/ui/model/Context","./DocumentListBinding","./PropertyListBinding","./PropertyBinding","./ContextBinding","sap/ui/model/FilterOperator"],function(a,b,c,d,e,f,g,h,i){var j=b.extend("meteor-ui5.model.mongo.Model",{constructor:function(a){b.apply(this,arguments),this.oData={},this.bDestroyed=!1,this.aBindings=[],this.mContexts={},this.iSizeLimit=a||100,this.sDefaultBindingMode=c.OneWay,this.mSupportedBindingModes={OneWay:!0,TwoWay:!1,OneTime:!1},this.bLegacySyntax=!1,this.sUpdateTimer=null}});return j.prototype.bindProperty=function(a,b,c){var d=new g(this,a,b,c);return d},j.prototype.bindList=function(a,b,c,d,g){var h;return h=b?new f(this,a,b,c,d,g):new e(this,a,b,c,d,g)},j.prototype.createBindingContext=function(a,b,c,d){"function"==typeof b&&(d=b,b=null),"function"==typeof c&&(d=c,c=null);var e=this.resolve(a,b),f=void 0==e?void 0:this.getContext(e?e:"/");return f||(f=null),d&&d(f),f},j.prototype._get=function(a,b,c){function d(b){return!(b&&void 0===(a=a[b]))}var e=b.replace(/\[/g,".").replace(/]/g,"").split(".").filter(Boolean);return e.every(d)?a:c},j.prototype.getProperty=function(a,b){var c=void 0;if(b){var d=this._getPathComponents(a,b),e=Mongo.Collection.get(d.collectionName).findOne(d.documentId);return e&&(c=d.propertyPath?"?"===d.propertyPath.charAt(0)?this._getLookupProperty(e,d.propertyPath):this._get(e,d.propertyPath):e),c}},j.prototype._getLookupProperty=function(a,b){var c=this._getPathComponents(b),d="/"+c.collectionName+"("+a[c.documentId]+")",e=this.getContext(d);return this.getProperty(c.propertyPath,e)},j.prototype.getObject=function(a,b){return this.getProperty(a,b)},j.prototype._getPathComponents=function(b,c){var d={collectionName:"",documentId:"",propertyPath:""},e=c?this.resolve(b,c):b,f=e.charAt(0);if("?"===f)e="/"+e.slice(1);else if("/"!==f){var g="Cannot find root element (Mongo Collection).";a.sap.log.fatal(g),this.fireParseError({srcText:g})}var h=e.split("/");if(""===h[0]&&h.shift(),h.length<1){var i="Unsupported binding path: "+e;a.sap.log.fatal(i),oModel.fireParseError({srcText:i})}var j=h[0],k=j.indexOf("(");if(k<0)d.collectionName=j;else{var l=j.indexOf(")");d.collectionName=j.substring(0,k),d.documentId=j.substring(k+1,l)}h.shift();var m=h.join(".");if(m){var n=m.indexOf(")");if(n>-1){var o=n+1;"."===m.charAt(o)&&(m=m.substr(0,o)+"/"+m.substr(n+1))}}return d.propertyPath=m,d},j.prototype.runQuery=function(a,b,c,d){var e=this._getPathComponents(a,b),f=Mongo.Collection.get(e.collectionName),g={};e.documentId?g._id=e.documentId:d&&d.length&&(g=this._buildMongoSelector(d));var h={limit:this.iSizeLimit};c&&c.length&&(h.sort=this._buildMongoSortSpecifier(c));var i=f.find(g,h);return i},j.prototype._buildMongoSelector=function(b){var c=this,d={},e=new Map;b.forEach(function(b){if(b._bMultiFilter){var d="MultiFilter not yet supported by ListBinding.";return a.sap.log.fatal(d),void c.oModel.fireParseError({srcText:d})}var f={};switch(b.sOperator){case i.BT:f.$gte=b.oValue1,f.$lte=b.oValue2;break;case i.Contains:f.$regex=new RegExp(b.oValue1),f.$options="i";break;case i.StartsWith:f.$regex=new RegExp("^"+b.oValue1),f.$options="i";break;case i.EndsWith:f.$regex=new RegExp(b.oValue1+"$"),f.$options="i";break;case i.EQ:f=b.oValue1;break;case i.GE:f.$gte=b.oValue1;case i.GT:f.$gt=b.oValue1;break;case i.LE:f.$lte=b.oValue1;break;case i.LT:f.$lt=b.oValue1;break;case i.NE:f.$ne=b.oValue1;break;default:var g="Filter operator "+b.sOperator+" not supported.";return a.sap.log.fatal(g),void c.oModel.fireParseError({srcText:g})}var h=b.sPath;e.has(h)||e.set(h,[]);var j={};j[h]=f,e.get(h).push(j)});var f=[];return e.forEach(function(a){1===a.length?f.push(a[0]):f.push({$or:a})}),f.length>1?d.$and=f:d=f[0],d},j.prototype._buildMongoSortSpecifier=function(b){var c=this,d={};return b.forEach(function(b){var e=b.sPath.indexOf("/")>-1,f=b.sPath.indexOf(".")>-1;if(e||f){var g="Currently unsupported list sorting path: "+b.sPath;return a.sap.log.fatal(g),void c.oModel.fireParseError({srcText:g})}if(b.fnCompare){var h="Custom sort comparator functions currently unsupported";return a.sap.log.fatal(h),void c.oModel.fireParseError({srcText:h})}d[b.sPath]=b.bDescending?-1:1}),d},j.prototype.bindContext=function(a,b,c){var d=new h(this,a,b,c);return d},j.prototype.getContext=function(b){if(!a.sap.startsWith(b,"/"))throw new Error("Path "+b+" must start with a / ");var c=this.mContexts[b];return c||(c=new d(this,b),this.mContexts[b]=c),c},j.prototype.resolve=function(b,c){var d,e="string"==typeof b&&!a.sap.startsWith(b,"/"),f=b;return e&&(c?(d=c.getPath(),f=d+(a.sap.endsWith(d,"/")?"":"/")+b):f=this.isLegacySyntax()?"/"+b:void 0),!b&&c&&(f=c.getPath()),f&&"/"!==f&&a.sap.endsWith(f,"/")&&(f=f.substr(0,f.length-1)),f},j.prototype.destroy=function(){this.aBindings.forEach(function(a){a.hasOwnProperty("destroy")&&a.destroy()}),b.prototype.destroy.apply(this,arguments)},j});