global.resourcePublicPath = global.resourcePublicPath || 'https://jhudson8.github.io/choyo/';
__webpack_public_path__ = global.resourcePublicPath;

var React = require('react');
var Backbone = require('backbone');
var _ = require('underscore');
var Context = require('./context');
require('../styles/style.css');

var context;

module.exports = {
  reset: reset,
  startBook: startBook,
  currentPage: currentPage,
  showPage: showPage
};

function reset(book) {
  Context.clear();
  context = new Context();
  return context;
}

function startBook(book, context, navigate) {
  var CoverPage = require('./cover-page');

  function onClick() {
    if (book.setup) {
      book.setup.call(context);
    }
    context.save();
    navigate('page/main', true);
  }
  React.render(<CoverPage book={book} onClick={onClick}/>, document.getElementById('book'));
  return context;
}

function currentPage(book, context, navigate) {
  if (!context) {
    context = Context.restore();
    if (!context || !context._pageId) {
      return navigate('book', true);
    }
  }
  navigate('page/' + context._pageId, {replace: true, trigger: true});
}

function showPage(pageId, book, context, navigate) {
  if (!context) {
    context = Context.restore();
    if (!context) {
      return navigate('book', true);
    }
  }

  var Page = require('./page');
  var handler = book.pages[pageId];
  if (!handler) {
    handler = {
      content: function() {
        return <div>
          FIX ME: The page <b>{pageId}</b> does not exist.
        </div>
      }
    }
  }
  context._pageId = pageId;

  if (handler.vars) {
    _.each(handler.vars, function(value, key) {
      context[key] = value;
    });
  }

  context.save();
  var _spacer = {
    content: function() {
      return <div></div>;
    }
  }
  React.render(<Page handler={_spacer} context={context} navigator={navigate}/>, document.getElementById('book'));
  setTimeout(function() {
    React.render(<Page id={pageId} handler={handler} context={context} navigator={navigate}/>, document.getElementById('book'));
  }, 250);
}
