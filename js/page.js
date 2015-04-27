var React = require('react');
var _ = require('underscore');
var Backbone = require('backbone');
var FormField = require('./form-field');
var CodeBlock = require('./code-input');

module.exports = React.createClass({
  displayName: 'Page',

  getInitialState: function() {
    return {};
  },

  render: function() {
    var page = this.props.page;

    var deletePage = this.props.id !== 'main' ?
      <button type="button" className="btn-delete" onClick={this.props.deletePage}>Delete this page</button> : undefined;

    var contentError = this.state.contentError && <div className="content-error">{this.state.contentError}</div>

    var codeBlocks;
    if (this.state.advanced) {
      codeBlocks = <div>
        <h4>Code and Variables</h4>
        <CodeBlock label="When page is shown" content={page.onShow} save={this.saveOnShow}/>
        <CodeBlock label="When choice is made" content={page.onLeave} save={this.saveOnLeave}
          params={['id']}/>
      </div>
    }

    return <div className="page-details">
      <h2>Page: "{this.props.id}"</h2>
      Enter your page contents below
      <br/>
      <textarea ref="content" className="page-content" defaultValue={formatContent(page.content)} onChange={this.save}/>
      {contentError}
      <div className="add-new-page">
        {deletePage}
      </div>

      <Transitions transitions={page.transitions} save={this.props.save}
        fromTransitions={this.props.fromTransitions}/>

      {codeBlocks}

      <p>
        <br/>
        <input type="checkbox" onChange={this.showAdvancedFeatures} defaultChecked={this.state.advanced} id="advanced"/>
        &nbsp;
        <label htmlFor="advanced">show advanced features</label>
      </p>
    </div>
  },

  showAdvancedFeatures: function(ev) {
    this.setState({
      advanced: ev.currentTarget.checked
    });
  },

  save: function(ev) {
    ev && ev.preventDefault();
    var content = resolveContent(this.refs.content.getDOMNode().value);
    var error = isValidContent(content);
    if (error) {
      this.setState({contentError: error});
      return;
    } else {
      this.setState({contentError: false});
    }
    this.props.page.content = content;
    this.props.save();
    this.forceUpdate();
  },

  saveOnShow: function(value) {
    this.props.page.onShow = value;
    this.props.save();
    this.forceUpdate();
  },

  saveOnLeave: function(value) {
    this.props.page.onLeave = value;
    this.props.save();
    this.forceUpdate();
  },
});


var Transitions = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    var transitions = this.props.transitions,
        self = this;
    transitions = _.map(transitions, function(transition) {
      function _delete() {
        var index = self.props.transitions.indexOf(transition);
        self.props.transitions.splice(index, 1);
        self.forceUpdate();
      }
      return <Transition transition={transition} delete={_delete} save={this.props.save}/>
    }, this);

    if (transitions.length) {
      transitions = <div className="saved-transitions">
        {transitions}
      </div>
    } else {
      transitions = 'You haven\'t added any choices yet.  If you don\'t, this will be the last page of your story.';
    }

    var addChoice;
    if (this.state.addingChoice) {
      addChoice = <div>
        <h4>Add new choice</h4>
        <form className="add-transition" onSubmit={this.onSubmit}>
          <FormField name="label" ref="label" label="choice label"/>
          <div className="form-field-message">This is what the button label for the choice shows</div>
          <FormField name="id" ref="id" label="page id"/>
          <div className="form-field-message">
            This is a nickname for the page this choice will take you to, like "page1".  It's ok if a page with this id doesn't exist.  You will be able to click on the choice page link to create it.
          </div>

          <div className="add-transition-action">
            <button type="submit" className="btn-save">Save this choice</button>
            <button type="button" onClick={this.cancelAddChoice}>Cancel</button>
          </div>
        </form>
      </div>
    } else {
      addChoice = <div className="add-transition-action">
        <button type="button" className="btn-save" onClick={this.doAddChoice}>Add a new choice</button>
      </div>
    }

    var fromTransitions;
    if (this.props.fromTransitions.length) {
      var fromTransitionChildren = _.map(this.props.fromTransitions, function(transition) {
        var id = transition.id;
        var label = transition.label;
        return <a className="from-transition-id" href={'#editor/page/' + id}>{id === 'main' ? 'Start Page' : id} ("{label}")</a>;
      });
      fromTransitions = <div>
        <h4>Choices from other pages that lead here</h4>
        {fromTransitionChildren}
      </div>;
    }

    return <div className="page-transitions">
      <h4>Page chioces</h4>
      {transitions}
      {addChoice}
      {fromTransitions}
    </div>;
  },

  doAddChoice: function() {
    this.setState({
      addingChoice: true
    });
  },

  cancelAddChoice: function() {
    this.refs.id.clear();
    this.refs.label.clear();
    this.setState({
      addingChoice: false
    });
  },

  onSubmit: function(ev) {
    ev.preventDefault();
    var data = {};
    this.refs.id.serialize(data);
    this.refs.label.serialize(data);
    this.refs.id.clear();
    this.refs.label.clear();

    if (data.id && data.label) {
      data.id = data.id.replace(/\s/, '_');
      data.label = data.label;
      this.props.transitions.push(data);
      this.props.save();
      this.setState({
        addingChoice: false
      });
    } else {
      alert('id or label missing');
    }
  }
});

function formatContent(content) {
  if (!content) return '';
  content = content.replace(/<br\/>\n/g, '\n');

  // convert easy input fields
  var inputRegex = /<\s*input\s+[^\/>]*\/\s*>/g;
  content = content.replace(inputRegex, function(stuff) {
    var ref = stuff.match(/ref\s*=\s*"([^"]+)"/)
    if (ref) {
      return '{<' + ref[1] + '>}';
      } else {
      return stuff;
      }
  });

  // handle this...
  var nameRegex = /\{\s*this.[^\.\}\(]+\s*\}/g;
  content = content.replace(nameRegex, function(stuff) {
  stuff = stuff.replace(/\{\s*this\./, '').replace('}', '');
    return '{' + stuff + '}';
  });

  return content;
}

function resolveContent(content) {
  if (!content) return '';
  content = content.replace(/\n/g, '<br/>\n');

  // convert easy input fields
  var inputRegex = /\{\s*<([^>]+)>\}/g;
  content = content.replace(inputRegex, function(stuff) {
    var name = stuff.replace(/[\{\}<>]/g, '');
    return '<input type="text" ref="' + name + '"/>';
  });

  // handle this....
  var varRegex = /\{\s*[^\.\}]+\s*\}/g;
  content = content.replace(varRegex, function(stuff) {
  stuff = stuff.replace(/[\{\}]/g, '');
    return '{this.' + stuff + '}';
  });

  return content;
}

function isValidContent(content) {
  try {
    require('react-tools').transform('<div>' + content + '</div>');
  } catch (e) {
    return e.message;
  }
  
}

var Transition = React.createClass({
  render: function() {
    var transition = this.props.transition;

    return <div className="page-transition">
      <button type="button" className="btn-delete" onClick={this.props.delete}>delete</button>
      <input type="text" defaultValue={transition.label} onChange={this.onChange}/> to
      <a className="transition-id-label" href={'#editor/page/' + encodeURIComponent(transition.id)}>{transition.id}</a>
    </div>;
  },

  onChange: function(ev) {
    this.props.transition.label = ev.currentTarget.value;
    this.props.save();
  }
})