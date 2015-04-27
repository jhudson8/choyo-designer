var React = require('react');
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = React.createClass({

  render: function() {
    var pages = this.props.pages;

    pages = _.compact(_.map(pages, function(page, id) {
      if (id !== 'main') {
        return <li><a key={id} className="page-nav" href={'#editor/page/' + encodeURIComponent(id)}>{id}</a></li>
      }
    }));

    return <div className="nav-container">
      <div className="nav-links">
        <button className="btn" onClick={link('editor')}>Edit Cover Page</button>
        <button type="button" onClick={this.props.addPage}>Add new page</button>
        <button onClick={link('editor/output')}>Share my story</button>
        <button className="btn" onClick={link('editor/json-output')}>Backup / Restore</button>
      </div>
      <h3>Your Pages</h3>
      <ul className="nav">
        <li><a className="page-nav" href="#editor/page/main">Start Page</a></li>
        {pages}
      </ul>
    </div>;
  },

  serialize: function(data) {
    data[this.props.name] = this.refs.input.value;
  }
});

function link(route) {
  return function() {
    Backbone.history.navigate(route, true);
  }
}