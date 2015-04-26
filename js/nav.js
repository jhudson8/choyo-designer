var React = require('react');
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = React.createClass({

  render: function() {
    var pages = this.props.pages;

    pages = _.map(pages, function(page, id) {
      return <li><a key={id} className="page-nav" href={'#editor/page/' + encodeURIComponent(id)}>{id}</a></li>
    });

    return <div className="nav-container">
      <div className="nav-links">
        <button onClick={link('editor/output')}>Share Book</button>
        <button className="btn" onClick={link('editor/json-output')}>Backup / Restore</button>
        <button className="btn" onClick={link('editor')}>Cover Page</button>
      </div>
      <h3>Pages</h3>
      <ul className="nav">
        {pages}
      </ul>
      <button type="button" onClick={this.props.addPage}>Add new page</button>
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