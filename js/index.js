/*
global.resourcePublicPath = global.resourcePublicPath || 'https://dl.dropboxusercontent.com/u/6589453/book/app/';
__webpack_public_path__ = global.resourcePublicPath;
*/

var React = require('react');
var Backbone = require('backbone');
var _ = require('underscore');
require('./style.css');

var data = localStorage.getItem('editor')
data = JSON.parse(data || '{"title": "", "pages": {"main": {"transitions": []}}}');
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
    save={save} newPage={newPage} deletePage={_deletePage}/>);
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
    doAddPage(pageId.replate(/\s/g, '_'));
  } else {
    alert('I couldn\'t make a new page because you didn\'t enter a page id');
  }
}

function doAddPage(pageId) {
  data.pages[pageId] = {transitions: []};
  save();
  Backbone.history.navigate('editor/page/' + encodeURIComponent(pageId), true);
}

function render(component) {
  React.render(<div/>, document.body);

  var Nav = require('./nav');
  var toRender = <div className="body-container">
    <nav><Nav pages={data.pages} addPage={newPage}/></nav>
    <div className="body-content">{component}</div>
  </div>
  React.render(toRender, document.body);
}

var save = _.throttle(function() {
  localStorage.setItem('editor', JSON.stringify(data));
}, 3000);


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
