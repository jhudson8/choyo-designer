global.React = require('react');
global.Backbone = require('backbone');
global._ = require('underscore');
require('./style.css');

var save = _.throttle(function() {
  localStorage.setItem('editor', JSON.stringify(data));
}, 3000);

var DEFAULT_DATA = '{"title": "", "pages": {"main": {"transitions": []}}}';
var data = localStorage.getItem('editor')
data = JSON.parse(data || DEFAULT_DATA);
if (!data.variables) {
  data.variables = {};
  save();
}

function showOutput() {
  var Output = require('./output');
  render(<Output data={data}/>);
}

function showJSONOutput() {
  var Output = require('./json-output');
  var _restore = function(_data) {
    data = _data;
    save();
    alert('book restored');
    Backbone.history.navigate('editor/main', {trigger: true, replace: true});
  }
  render(<Output data={data} restore={_restore}/>);
}

function showPage(pageId) {
  var PageView = require('./page');
  var pageData = data.pages[pageId];

  if (!pageData) {
    if (confirm('Page does not exist, add it?')) {
      doAddPage(pageId);
      pageData = data.pages[pageId];
    } else {
      return;
    }
  }

  if (!pageData.transitions) {
    pageData.transitions = [];
  }

  function _deletePage() {
    if (confirm('are you sure you want to delete page "' + pageId + '"?')) {
      delete data.pages[pageId];
      save();
      Backbone.history.navigate('editor/main', true);
    }
  }

  render(<PageView id={pageId} page={pageData} fromTransitions={getTransitions(pageId)}
    save={save} newPage={newPage} deletePage={_deletePage} book={data}/>);
}

function showMain() {
  var MainPage = require('./main');
  render(<MainPage data={data} addPage={newPage} save={save}/>);
}

function getTransitions(pageId) {
  var ids = [];
  _.each(data.pages, function(page, id) {
    for (var i=0; i<page.transitions.length; i++) {
      if (page.transitions[i].id === pageId) {
        ids.push(page.transitions[i]);
        break;
      }
    }
  });
  return ids;
}

function newPage() {
  var pageId = prompt('What is the page id?');
  if (pageId) {
    doAddPage(pageId.replace(/\s/g, '_'));
  } else {
    alert('I couldn\'t make a new page because you didn\'t enter a page id');
  }
}

function startOver() {
  if (confirm('Are you sure you want to start over?')) {
    data = JSON.parse(DEFAULT_DATA);
    save();
    React.unmountComponentAtNode(document.getElementById('designer'));
    showMain();
  }
}

function doAddPage(pageId) {
  data.pages[pageId] = {transitions: []};
  save();
  Backbone.history.navigate('editor/page/' + encodeURIComponent(pageId), true);
}

function render(component) {
  React.render(<div/>, document.getElementById('designer'));

  var Nav = require('./nav');
  var toRender = <div className="body-container">
    <nav><Nav pages={data.pages} addPage={newPage} startOver={startOver} testBook={testBook}/></nav>
    <div className="body-content">{component}</div>
  </div>
  React.render(toRender, document.getElementById('designer'));
}

var testing = false;
function testBook() {
  alert('type "q" to return to the editor');

  testing = true;
  var el = document.getElementById('designer');
  React.unmountComponentAtNode(el);
  el.style.display = 'none';
  el.innerHTML = '';

  document.getElementById('designer')

  var book = wrapBookForTesting();
  var engine = require('choyo/js/engine');
  var context = engine.reset();
  context.save = function() {};

  // show the main page
  function navigator(route) {
    if (!route || route === 'main' || route === 'book') {
      context = engine.reset();
      context.save = function() {};
      context = engine.startBook(book, context, navigator);
      return;
    }
    var pattern = /page\/(.+)/;
    var match = route.match(pattern);
    if (match) {
      engine.showPage(match[1], book, context, navigator);
    } else {
      alert('unknown route: ' + route);
    }
  }

  engine.startBook(book, context, navigator);
}

function wrapBookForTesting() {
  var _book = {
    title: data.title,
    pages: {}
  };
  if (data.setup) {
    var func = '(function() {\n' + data.setup + '\n}).call(this)';
    _book.setup = function() {
      eval(func);
    }
  }

  _.each(data.pages, function(page, id) {
    var _page = {}
    _page.choices = page.transitions;
    _page.content = function(React) {
      if (page.onShow) {
        var showFunc = '(function() {\n' + page.onShow + '\n}).call(this)';
        eval(showFunc);
      }

      var componentCode = require('react-tools').transform('<div>' + (page.content || '') + '</div>');
      var _component;
      var componentFunc = '(function() {\n_component = ' + componentCode + ' }).call(this);';
      eval(componentFunc);
      return _component || <div></div>;
    }

    if (page.onLeave) {
      var leaveFunc = 'leaveRtn = (function() {\n' + page.onLeave + '\n}).call(this, id)';
      _page.choiceMade = function(id) {
        var leaveRtn;
        eval(leaveFunc);
        return leaveRtn;
      }
    }
    _book.pages[id] = _page;
  });
  return _book;
}


var Router = Backbone.Router.extend({
  routes: {
    'editor/page/:pageId': showPage,
    'editor/main': showMain,
    'editor/output': showOutput,
    'editor/json-output': showJSONOutput,
    'editor': showMain,
    '': showMain,
  }
});
new Router();
Backbone.history.start();


document.body.onkeypress = function(e) {
  if (!testing) {
    return;
  }
  e = e || window.event;
  var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
  if (charCode === 113) {
    // "q"
    document.getElementById('designer').style.display = 'block';
    testing = false;
    var el = document.getElementById('book');
    React.unmountComponentAtNode(el);
    el.innerHTML = '';

    Backbone.history.loadUrl();
  }
};