global.resourcePublicPath = global.resourcePublicPath || 'https://jhudson8.github.io/choyo/';
__webpack_public_path__ = global.resourcePublicPath;

var React = require('react');
var Backbone = require('backbone');
var _ = require('underscore');
var Context = require('./context');
require('../styles/style.css');

var engine = require('./engine');

function checkForBook() {
  var context, book;

  if (!window.book) {
    return setTimeout(checkForBook, 1000);
  }

  book = window.book(React);
  context = engine.reset(book);

  document.body.innerHTML = '<div id="book" class="book"></div>';
  var Router = Backbone.Router.extend({
    routes: {
      'page/:pageId': 'showPage',
      'book': 'startBook',
      '': 'currentPage'
    },

    showPage: function(pageId) {
      engine.showPage(pageId, book, context, navigate);
    },

    startBook: function() {
      context = engine.startBook(book, navigate);
    },

    currentPage: function() {
      engine.currentPage(book, context, navigate);
    }
  });
  new Router();
  Backbone.history.start();
}
checkForBook();


function navigate(route, options) {
  options = options || true;
  if (options === true) {
    options = {trigger: true, replace: false};
  }
  _options = _.clone(options);
  _options.trigger = false;
  Backbone.history.navigate(route, _options);
  if (options.trigger) {
    Backbone.history.loadUrl(route);
  }
}
