var React = require('react');
var _ = require('underscore');

module.exports = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    if (this.props.hide) {
      return <div></div>;
    }

    if (this.state.visible) {
      return <div className="code-block-container">
        <div className="open-code-block">
          <h5>{this.props.label}</h5>
          <textarea ref="input" className="function-input" defaultValue={this.props.content}/>
          <br/>
          <button type="button" className="btn-save" onClick={this.save}>Save</button>
          <button type="button" onClick={this.toggleContent}>Cancel</button>
        </div>
      </div>;
    } else {
      return <div className="code-block-container">
        <button className="closed-code-block" onClick={this.toggleContent}>code: {this.props.label}</button>
      </div>
    }
  },

  save: function(ev) {
    var context = this.pseudoContext();
    var params = this.props.params || []
    var value = this.refs.input.getDOMNode().value;

    if (this.props.validate !== false) {
      var fullFunc = '(function(';
      fullFunc += _.map(params, function(param) { return param; }).join(',');
      fullFunc += (') {\n' + value + ' }).call(context');
      if (params.length > 0) {
        fullFunc += ', ';
      }
      fullFunc += _.map(params, function(param) { return '"' + param + '"'; }).join(',');
      fullFunc += ')';
      try {
        eval(fullFunc)
      } catch (e) {
        alert('error: ' + e.message);
        return;
      }
    }

    this.props.save(value);
    this.setState({
      visible: false
    });
  },

  toggleContent: function() {
    this.setState({
      visible: !this.state.visible
    });
  },

  pseudoContext: function() {
    var rtn = {};
    _.each(['addTransition', 'removeTransition', 'maybe', 'randomNumber', 'oneOf',
        'val', 'startWithCap', 'genderRef'], function(key) {
      rtn[key] = function() {
        return '';
      }
    });
    return rtn;
  }
});
