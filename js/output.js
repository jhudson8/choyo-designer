var React = require('react');
var _ = require('underscore');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      fullPage: true
    };
  },
  render: function() {
    var fullPage = this.state.fullPage;
    var pageContent, fullPageLabel, headerMessage;
    if (fullPage) {
      pageContent = fullPageContent('\n\n\n// BOOK CODE IS BELOW\n\n' + formatData(this.props.data) + '\n\n// END OF BOOK CODE\n\n\n', this.props.data.title, this.props.data.style);
      fullPageLabel = 'Complete page content';
      headerMessage = 'Copy the contents and paste to a file called mybook.html and open that file with your browser';
    } else {
      pageContent = formatData(this.props.data);
      fullPageLabel = 'Code only';
      headerMessage = 'Copy and past over just the code if you already have an html page you are using';
    }

    return <div>
      {headerMessage}
      <br/>
      <br/>
      <input type="checkbox" id="fullPage" defaultChecked={this.state.fullPage} onChange={this.toggleFullPage}/>
      &nbsp;&nbsp;&nbsp;
      <label htmlFor="fullPage">{fullPageLabel}</label>
      <br/>
      <textarea className="output" value={pageContent} readOnly={true}/>
    </div>;
  },

  toggleFullPage: function(ev) {
    var fullPage = ev.currentTarget.checked;
    this.setState({
      fullPage: fullPage
    });
  }
});

function formatData(data) {
  var rtn = 'book = function(React) {\n' +
    '\treturn {\n' +
    '\n\t\ttitle: "' + data.title + '",\n';

    if (data.setup) {
      rtn = rtn + '\n\t\tsetup: function() {\n' +
        data.setup + '\n' +
        '\t\t},'
    }

    rtn += '\n\t\tpages: {\n';

  rtn += _.map(data.pages, function(page, id) {
    var rtn = '\t\t\t"' + id + '": {\n' +
      '\t\t\t\tcontent: function() {\n';

      if (page.onShow) {
        rtn = rtn += page.onShow + '\n';
      }

      rtn = rtn + '\t\t\t\t\treturn <div>\n' +
      (page.content || '') + '\n' +
      '\t\t\t\t\t</div>;\n' +
      '\t\t\t\t},\n';

      if (page.onLeave) {
        rtn = rtn += '\t\t\t\tchoiceMade: function(id) {\n' +
        page.onLeave + '\n' +
        '\t\t\t\t},\n';
      }

      rtn = rtn + '\t\t\t\tchoices: [\n';
    rtn = rtn + _.map(page.transitions, function(transition) {
      return '\t\t\t\t\t"[' + transition.id + '] ' + transition.label.replace('"', '\\"') + '"'
    }).join(',\n');
    rtn = rtn + '\n\t\t\t\t]\n';
    return rtn;
  }).join('\t\t\t},\n');

  rtn = rtn + '\t\t\t}\n' +
    '\t\t}\n' +
    '\t}\n' +
    '}\n';
  return rtn;
}

function fullPageContent(code, title, style) {
  var rtn = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '  <head>\n' +
    '    <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n' +
    '    <title>' + title + '</title>\n' +
    '\n' +
    '    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Walter%20Turncoat">\n' +
    '    <script src="https://fb.me/JSXTransformer-0.13.2.js"></script>\n' +
    '    <script type="text/jsx">\n';
  rtn = rtn + code + '\n';
  rtn = rtn + '    </script>\n';

  if (style) {
    rtn = rtn + '    <style>\n' +
      style + '\n' +
      '    </style>\n';
  }

  rtn = rtn + '  </head>\n' +
    '  <body></body>\n' +
    '  <script src="http://jhudson8.github.io/choyoadv/app.js"></script>\n' +
    '</html>\n';
  return rtn;
}
