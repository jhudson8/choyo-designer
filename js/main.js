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
      <h2>Choose your own adventure story builder</h2>

      <FormField ref="title" label="Book Title" name="title" defaultValue={data.title} onChange={this.saveTitle}/>

      <CodeBlock label="book style (CSS)" content={data.style} save={this.saveStyle}
        validate={false} hide={!this.state.advanced} hint={function() { return <StyleHelp/> ;}}/>

      <CodeBlock label="when story begins" content={data.setup} save={this.saveSetup}
        hide={!this.state.advanced} hint={function() { return <StoryHelp/>; }}/>

      <div className="book-messge">
        <p>
          Each page in your book has an id (like a nickname).  That is how I match a choice with another page.
        </p>
        <p>
          When you make new pages, you will see links on the left to edit the page.
        </p>
        <p>
          <button type="button" className="view-start-page" onClick={this.link('editor/page/main')}>View your start page</button>
          or <button type="button" className="view-start-page" onClick={this.props.addPage}>Add a new page</button>.
        </p>
        <p>
          You can always come back here by clicking <b>Edit cover page</b> on the left of the screen.
        </p>
        <p>
          When you are happy with your book and want to share it or you just want to test it out
        </p>
        <p>
          <button type="button" className="view-start-page" onClick={this.link('editor/page/main')}>Share my story</button>
        </p>
        <p>
          To see an example story (and what you can do if you want to program just a little bit), check out <a href="http://jhudson8.github.io/choyo-designer/story-thebomb.html" target="_blank">The Bomb!</a>.
        </p>
        <p>
          To see how "The Bomb!" was created, click <button type="button" className="view-start-page" onClick={this.link('editor/json-output')}>Backup / Restore</button> and, in the restore section at the bottom, paste in <a href="http://jhudson8.github.io/choyo-designer/story-thebomb-src.json">this stuff</a>.  Then click "Restore" (Make sure to "show advanced features" (see bottom here and when looking at the pages) to see the programming.
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

  link: function(route) {
    return function() {
      Backbone.history.navigate('#' + route, true);
    }
  },

  saveTitle: function() {
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
  }
});

var StyleHelp = React.createClass({
  render: function() {
    return <div>
      <p>
        Add any <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="css">CSS</a> content.
        The class name for the cover page is <b>cover</b> and <b>page</b> for each page.
        Also, each page element has an id matching the page id.
      </p>
      <p>
        For example, to set a cover page image
<pre className="code">
.cover {'{\n'}
{'  '}background-image: url(http://the/image/url) !important;{'\n'}
{'  '}background-size: 100% 100%;{'\n'}
{'}'}
</pre>
      </p>
    </div>
  }
});

var StoryHelp = React.createClass({
  render: function() {
    return <div>
      <p>
        Use <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" target="javascript">javascript</a> to
        set up variables that can be used in your story to make it different each time you read it.
        <br/>
        Use "this.variableName" to set one.
      </p>
      <p>
        For example, if I wanted to create a 4 digit random code to a safe
<pre className="code">
this.safeCode = this.randomNumber(1000, 9999);
</pre>
      </p>
      <p>
          Or, to set a car paint color (the variable name can only have letters from the alphabet).
<pre className="code">
this.paintColor = "green";
</pre>
Look at the code for your pages to see examples of how these variables can be used and changed.
      </p>
    </div>
  }
});

