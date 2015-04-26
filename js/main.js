var React = require('react'),
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
      <FormField ref="title" label="Book Title" name="title" defaultValue={data.title}/>

      <CodeBlock label="Style (CSS) code" content={data.style} save={this.saveStyle} validate={false}/>

      <CodeBlock label="Setup code" content={data.setup} save={this.saveSetup}/>

      <div className="book-title-actions">
        <button type="button" className="btn-save" onClick={this.save}>Save book info</button>
      </div>

      <div className="book-messge">
        <p>
          Each page in your book has an id (like a nickname) and that is how you will match a choice with another page.
        </p>
        <p>
          Your first page has a specicial page id of "main".  Take a look at your <a href="#editor/page/main">fist page</a>.
        </p>
      </div>
    </div>;
  },

  save: function() {
    this.refs.title.serialize(this.props.data);
    this.props.save();
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
