import '@babel/polyfill';
import Promise from 'bluebird/js/browser/bluebird.min';
global.oriPromise = global.Promise;
global.Promise = Promise;