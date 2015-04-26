var React = require('react');
var _ = require('underscore');
var Backbone = require('backbone');
var FormField = require('./form-field');
var CodeBlock = require('./code-input');

module.exports = React.createClass({
  displayName: 'Page',

  render: function() {
    var page = this.props.page;

    var deletePage = this.props.id !== 'main' ?
      <button type="button" className="btn-delete" onClick={this.props.deletePage}>Delete this page</button> : undefined;

    return <div className="page-details">
      <h3>{this.props.id}</h3>
      Enter your page contents below
      <br/>
      <textarea ref="content" className="page-content" defaultValue={formatContent(page.content)}/>
      <div className="add-new-page">
        <button type="button" className="btn-save" onClick={this.save}>Save page contents</button> {deletePage}
      </div>

      <Transitions transitions={page.transitions} save={this.save}
        fromTransitions={this.props.fromTransitions}/>

      <h4>Code and Variables</h4>
      <CodeBlock label="When page is shown" content={page.onShow} save={this.saveOnShow}/>
      <CodeBlock label="When choice is made" content={page.onLeave} save={this.saveOnLeave}
        params={['id']}/>
    </div>
  },

  save: function(ev) {
    ev && ev.preventDefault();
    var content = resolveContent(this.refs.content.getDOMNode().value);
    var error = isValidContent(content);
    if (error) {
      return alert(error);
    }
    this.props.page.content = content;
    this.props.save();
    this.forceUpdate();
    alert('saved');
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
  render: function() {
    var transitions = this.props.transitions,
        self = this;
    transitions = _.map(transitions, function(transition) {
      function _delete() {
        var index = self.props.transitions.indexOf(transition);
        self.props.transitions.splice(index, 1);
        self.forceUpdate();
      }
      return <Transition transition={transition} delete={_delete}/>
    }, this);

    if (transitions.length) {
      transitions = <div className="saved-transitions">
        {transitions}
      </div>
    } else {
      transitions = 'There aren\'t any... add a new one below.  If you don\'t, this will be the last page of your book';
    }

    var fromTransitions;
    if (this.props.fromTransitions.length) {
      var fromTransitionChildren = _.map(this.props.fromTransitions, function(id) {
        return <a className="from-transition-id" href={'#editor/page/' + id}>{id}</a>;
      });
      fromTransitions = <div>
        <h4>Transitions to this page</h4>
        {fromTransitionChildren}
      </div>;
    }

    return <div className="page-transitions">
      <h4>Page chioces</h4>
      {transitions}

      <h4>Add new choice</h4>
      <form className="add-transition" onSubmit={this.onSubmit}>
        <FormField name="id" ref="id" label="page id"/>
        <FormField name="label" ref="label" label="label"/>
        You can use a new <b>page id</b>.  You will have a link to create a new page with that id after you add this choice.
        <div className="add-transition-action">
          <button type="submit" className="btn-save">Save choice</button>
        </div>
      </form>

      {fromTransitions}
    </div>;
  },

  onSubmit: function(ev) {
    ev.preventDefault();
    var data = {};
    this.refs.id.serialize(data);
    this.refs.label.serialize(data);
    this.refs.id.clear();
    this.refs.label.clear();

    if (data.id && data.label) {
      this.props.transitions.push(data);
      this.props.save();
      this.forceUpdate();
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
      <input type="text" defaultValue={transition.label} onChange={this.onChange}/> to
        <a className="transition-id-label" href={'#editor/page/' + encodeURIComponent(transition.id)}>{transition.id}</a>
      <button type="button" className="btn-delete" onClick={this.props.delete}>delete</button>
    </div>;
  },

  onChange: function(ev) {
    this.props.transition.label = ev.currentTarget.value;
  }
})