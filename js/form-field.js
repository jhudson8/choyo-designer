var React = require('react');

module.exports = React.createClass({

  render: function() {
    var data = this.props.data;

    return <div className="form-field">
      <label className="label">{this.props.label}</label>
      <input ref="input" type="text" name={this.props.name} defaultValue={this.props.defaultValue}/>
    </div>;
  },

  serialize: function(data) {
    data[this.props.name] = this.refs.input.getDOMNode().value;
  },

  clear: function() {
    this.refs.input.getDOMNode().value = '';
  }
});
