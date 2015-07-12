module.exports = React.createClass({
  getInitialState: function() {
    return {
      filter: ''
    };
  },

  render: function() {
    var pages = this.props.pages;
    var filter = this.state.filter.replace('*', '.');
    var filterPattern = filter && new RegExp(filter, 'i');

    pages = _.compact(_.map(pages, function(page, id) {
      if (id !== 'main') {
        if (!filter || id.match(filterPattern)) {
          return <li><a key={id} className="page-nav" href={'#editor/page/' + encodeURIComponent(id)}>{id}</a></li>;
        }
      }
    }));

    return <div className="nav-container">
      <div className="nav-links">
        <button className="btn test-book" onClick={this.props.testBook}>Test my story</button>
        <button className="btn" onClick={link('editor')}>Edit cover page</button>
        <button type="button" onClick={this.props.addPage}>Add new page</button>
        <button onClick={link('editor/output')}>Share my story</button>
        <button className="btn" onClick={link('editor/json-output')}>Backup / Restore</button>
      </div>
      <div className="page-links">
        <h3>Your Pages</h3>
        <input className="nav-filter" placeholder="filter" onChange={this.onFilter}/>
        <ul className="nav">
          <li><a className="page-nav" href="#editor/page/main">Start Page</a></li>
          {pages}
        </ul>
        <button className="btn" onClick={this.props.startOver}>Start over</button>
      </div>
    </div>;
  },

  onFilter: function(ev) {
    var value = ev.currentTarget.value;
    this.setState({
      filter: value
    });
  },

  serialize: function(data) {
    data[this.props.name] = this.refs.input.value;
  }
});

function link(route) {
  return function() {
    Backbone.history.navigate(route, true);
  };
}
