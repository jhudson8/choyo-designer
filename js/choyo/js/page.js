var React = require('react');
var _ = require('underscore');
var Backbone = require('backbone');

module.exports = React.createClass({
  displayName: 'Page',

  getInitialState: function() {
    return {
      context: this.props.context,
      addTransitions: [],
      removeTransitions: {}
    };
  },

  render: function() {
    var self = this;
    var context = this.props.context;
    context.page = this;
    var handler = this.props.handler;
    var navigator = this.props.navigator;
    var content = handler.content;

    if (!content) {
      content = 'FIX ME: You need to provide the "content" attribute';
    }
    if (!_.isString(content)) {
      if (content.call) {
        // it's a function
        content = handler.content.call(context);
      } else {
        content = 'FIX ME: Invalid "content" attribute - it needs to be wrapped in function() { return... });';
      }
      if (!content) {
        content = 'FIX ME: Invalid "content" function - it didn\'t return anything';
      }
    }

    var choices = [];
    if (handler.choices) {
      _.each(handler.choices, function(value, key) {
        if (value.id) {
          key = value.id;
          value = value.label;
        }

        if (this.state.removeTransitions[key]) {
          // it has been manually removed
          return;
        }

        var choiceData = { page: key, label: value};
        choiceData = normalizeChoice(choiceData, context);

        if (!choiceData.page) {
          return alert('the choice "page" key wasn\'t provided for "' + choiceData.label + '"');
        }

        if (choiceData.label) {
          choices.push(<Choice data={choiceData} onChoiceMade={self.choiceMade}/>);
        }
      }, this);
    }

    _.each(this.state.addTransitions, function(transitionData) {
      var pageId = transitionData.id,
          label = transitionData.label;
      if (pageId && label) {
        var choiceData = { page: pageId, label: label};
        choiceData = normalizeChoice(choiceData, context);
        choices.push(<Choice data={choiceData} onChoiceMade={self.choiceMade}/>);
      }
    });

    var goToFunc = function(ev) {
      ev.preventDefault();

      var input = self.refs._pageId.getDOMNode();
      var pageId = input.value;
      input.value = '';
      if (pageId) {
        context.page = undefined;
        navigator('page/' + pageId, true);
      } else {
        alert('no page id entered');
      }
    }

    var debugPageGoTo = window.debugMode ? <span>
      <button type="submit" className="choice">go to page</button>
      <input type="text" ref="_pageId"/>
    </span> : undefined;

    content = prepareContent(content, context);
    var startOver = function() {
      navigator('book', true);
    }

    return <div id={this.props.id} className="page">
      <form onSubmit={goToFunc}>
        <button type="button" className="choice start-over" onClick={startOver}>start over</button>
        {debugPageGoTo}
      </form>
      <br/><br/>
      <form>
        <div className="content">{content}</div>
      </form>
      <div className="actions">{choices}</div>
    </div>;
  },

  choiceMade: function(choiceData) {
    var pageId = choiceData.page;
    var context = this.props.context;
    var handler = this.props.handler;
    context.page = this;
    this.saveInput(context);

    if (handler.choiceMade) {
      var _pageId = handler.choiceMade.call(context, choiceData.page);
      if (_pageId === false) {
        return;
      } else {
        pageId = _pageId || pageId;
      }
      context.page = undefined;
    } else {
      context.page = undefined;
    }

    context.saveChoice(pageId);
    context.save();

    this.props.navigator('page/' + pageId, true);
  },

  addChoice: function(id, label) {
    this.state.addTransitions.push({id: id, label: label});
  },

  removeChoice: function(id) {
    this.state.removeTransitions[id] = true;
  },

  refresh: function() {
    this.saveInput(this.state.context, true);
    this.forceUpdate();
  },

  saveInput: function(context, force) {
    _.each(this.refs, function(component, key) {
      if (key !== '_pageId') {
        var value = context.val(key);
        if (!_.isUndefined(value) && value !== '') {
          context[key] = value;
        } else {
          var defaultVal = component.props['data-default'];
          if (defaultVal || force) {
            context[key] = defaultVal;
          }
        }
      }
    }, this);
  }
});

var Choice = React.createClass({
  render: function() {
    var choiceData = this.props.data,
        self = this;

    function onClick() {
      self.props.onChoiceMade(choiceData);
    }

    return <button type="button" key={choiceData.label} className="choice" onClick={onClick}>
      {choiceData.label}
    </button>;
  }
});

function normalizeChoice(choiceData, context) {
  if (_.isNumber(choiceData.page)) {
    // array
    if (_.isString(choiceData.label)) {
      // [key] label
      var match = choiceData.label.match(/^\[([^\]]+)\]\s?(.+)/);
      if (match) {
        choiceData = {
          page: match[1],
          label: match[2]
        }
      } else {
        alert('invalid choice label format "' + choiceData.label + '"');
        return { label: undefined };
      }
    }
  }

  choiceData.label = prepareContent(_.isString(choiceData.label) ? choiceData.label : choiceData.label.call(context), context);
  return choiceData;
}

function prepareContent(content, context) {
  if (!_.isString(content)) {
    return content;
  }
  return content.replace(/\{[^\}]*\}/g, function(val) {
    val = val.substring(1).substring(0, val.length-2);
    var defaultVal;
    var match = val.match(/([^\s]*) or (.+)$/);
    if (match) {
      val = match[1];
        defaultVal = match[2];
    }
    return context[val] || defaultVal || '';
  });
}
