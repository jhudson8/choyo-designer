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

    var showHint = this.state.hintShown ?
      <button type="button" className="btn-info" onClick={this.toggleHint}>Hide hints</button> :
      <button type="button" className="btn-info" onClick={this.toggleHint}>Show hints</button>
    var hint = this.state.hintShown ?
      <div className="code-block-hint">{this.props.hint()}</div> : undefined;

    if (this.state.visible) {
      return <div className="code-block-container">
        <div className="open-code-block">
          <h5>{this.props.label}</h5>
          <textarea ref="input" className="function-input" defaultValue={this.props.content}/>
          <br/>
          <button type="button" className="btn-save" onClick={this.save}>Save</button>
          <button type="button" onClick={this.toggleContent}>Cancel</button>
          {showHint}
        </div>
        {hint}
      </div>;
    } else {
      return <div className="code-block-container">
        <button className="closed-code-block" onClick={this.toggleContent}>code: {this.props.label}</button>
      </div>
    }
  },

  toggleHint: function() {
    this.setState({
      hintShown: !this.state.hintShown
    });
  },

  save: function(ev) {
    var context = this.pseudoContext();
    var params = this.props.params || []
    var value = this.refs.input.getDOMNode().value;

    if (this.props.book && this.props.book.setup) {
      var setupFunc = '(function() {\n' + this.props.book.setup + '\n}).call(context);';
      try {
        eval(setupFunc)
      } catch (e) {
        // swallow
        console.log(e);
      }
      
    }

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
