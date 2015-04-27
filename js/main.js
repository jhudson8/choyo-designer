var React = require('react'),
    Backbone = require('backbone'),
    _ = require('underscore'),
    FormField = require('./form-field'),
    CodeBlock = require('./code-input');

module.exports = React.createClass({

  getInitialState: function() {
    return {};
  },

  render: function() {
    if (this.state.reset) {
      return <div></div>;
    }

    var data = this.props.data;

    return <div>
      <h2>Create your own choose your own adventure book</h2>

      <FormField ref="title" label="Book Title" name="title" defaultValue={data.title} onChange={this.saveTitle}/>

      <CodeBlock label="book style (CSS)" content={data.style} save={this.saveStyle}
        validate={false} hide={!this.state.advanced}/>

      <CodeBlock label="when story begins" content={data.setup} save={this.saveSetup} hide={!this.state.advanced}/>

      <div className="book-messge">
        <p>
          Each page in your book has an id (like a nickname) and that is how you will match a choice with another page.
        </p>
        <p>
          When you make new pages, you will see links on the left to edit the page.
        </p>
        <p>
          <button type="button" className="view-start-page" onClick={this.viewStartPage}>View your start page</button>
        </p>
        <p>
          <br/>
          <input type="checkbox" onChange={this.showAdvancedFeatures} defaultChecked={this.state.advanced} id="advanced"/>
          &nbsp;
          <label htmlFor="advanced">show advanced features</label>
        </p>
      </div>
    </div>;
  },

  showAdvancedFeatures: function(ev) {
    this.setState({
      advanced: ev.currentTarget.checked
    });
  },

  viewStartPage: function() {
    Backbone.history.navigate('#editor/page/main', true);
  },

  saveTitle: function() {
    debugger;
    this.refs.title.serialize(this.props.data);
    this.props.save();
  },

  save: function() {
    this.saveTitle();

    this.setState({
      reset: true
    });
    this.setState({
      reset: false
    });
  },

  saveSetup: function(value) {
    this.props.data.setup = value;
    this.save();
  },

  saveStyle: function(value) {
    this.props.data.style = value;
    this.save();
  },
});

var Variables = React.createClass({
  render: function() {
    var variables = this.props.variables,
        self = this;

    variables = _.map(variables, function(value, name) {
      function _delete() {
        delete self.props.variables[name];
        self.forceUpdate();
      }

      return <div className="variable-reference">
        <label>{name}</label>
        <span className="variable-reference-value">{value}</span>
        <button type="btn-delete" onClick={_delete}>delete</button>
      </div>
    });

    return <div>
      {variables}

      <div className="add-new-main-var">
        <FormField ref="addNewName" label="Name" name="addNewName"/>
        <FormField ref="addNewValue" label="Value" name="addNewValue"/>
        <div className="add-new-main-var-actions">
          <button type="button" onClick={this.addNew}>Add new variable</button>
        </div>
      </div>
    </div>;
  },

  addNew: function() {
    var data = {};
    this.refs.addNewName.serialize(data);
    this.refs.addNewValue.serialize(data);
    if (data.addNewName && data.addNewValue) {
      this.refs.addNewName.clear(data);
      this.refs.addNewValue.clear(data);
      this.props.variables[data.addNewName] = data.addNewValue;
      this.forceUpdate();
    }
  },

  onSave: function() {

  }
});
