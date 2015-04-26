var React = require('react');
var _ = require('underscore');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      fullPage: false
    };
  },
  render: function() {
    return <div>
      Copy the contents and save to a file to save your book for later use.
      <br/>
      <textarea className="output" value={JSON.stringify(this.props.data) + '\n'} readOnly={true}/>
      <br/>
      <br/>
      <br/>
      Or, paste the saved contents below to load a book
      <textarea ref="input" className="input"/>
      <button type="button" onClick={this.restore} className="btn-save">Restore</button>
    </div>;
  },

  restore: function() {
    var value = this.refs.input.getDOMNode().value;
    if (value) {
      try {
        var data = JSON.parse(value);
        if (confirm('Are you sure you want to DELETE the current book and restore this one?')) {
          this.props.restore(data);
        }
      } catch (e) {
        alert(e.message);
      }
      
    } else {
      alert('no content');
    }
  }
});
