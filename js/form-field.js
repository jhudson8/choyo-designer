module.exports = React.createClass({
  displayName: 'FormField',

  render: function() {
    var data = this.props.data;

    return <div className="form-field">
      <label className="label">{this.props.label}</label>
      <input ref="input" type="text" name={this.props.name}
        defaultValue={this.props.defaultValue} onChange={this.props.onChange}/>
    </div>;
  },

  serialize: function(data) {
    data[this.props.name] = this.refs.input.getDOMNode().value;
  },

  clear: function() {
    this.refs.input.getDOMNode().value = '';
  }
});
