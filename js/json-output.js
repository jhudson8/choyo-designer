module.exports = React.createClass({
  getInitialState: function() {
    return {
      fullPage: false
    };
  },
  render: function() {
    return <div>
      Copy and save the contents below (so you can restore them later).
      <br/>
      <textarea className="json-output" value={JSON.stringify(this.props.data) + '\n'} readOnly={true}/>
      <br/>
      <br/>
      <br/>
      Or, paste previously saved contents to restore a story.
      <textarea ref="input" className="input"/>
      <button type="button" onClick={this.restore} className="btn-save">Restore</button>
      <br/>
      <br/>
      Note: your story will save as you make changes but this allows you to keep a backup in case your browser cache is cleared.
    </div>;
  },

  restore: function() {
    var value = this.refs.input.getDOMNode().value;
    if (value) {
      try {
        var data = JSON.parse(value);
        if (confirm('Are you sure you want to DELETE the current book and restore this one?')) {
          this.props.restore(data);
        }
      } catch (e) {
        alert(e.message);
      }
      
    } else {
      alert('no content');
    }
  }
});
