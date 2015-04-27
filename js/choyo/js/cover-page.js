var React = require('react');

module.exports = React.createClass({
  render: function() {
    var book = this.props.book;

    return <div className="cover" onClick={this.props.onClick}>
      <h1 className="book-title">{book.title}</h1>
      <div className="cover-hint">Click anywhere to begin the story</div>
    </div>;
  }
});
