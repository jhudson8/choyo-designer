var _ = require('underscore');

var Context = module.exports = function() {
  this._choices = [];
};
_.extend(Context.prototype, {
  addChoice: function(id, label) {
    this.page.addChoice(id, label);
  },

  removeChoice: function(id) {
    this.page.removeChoice(id);
  },


  maybe: function(marker) {
    return Math.random() <= ((marker || 5) / 10);
  },
  randomNumber: function(low, high) {
    var range = high - low;
    return Math.round(Math.random() * range) + low;
  },
  oneOf: function(arr) {
    var index = this.randomNumber(0, arr.length-1);
    return arr[index];
  },

  val: function(ref) {
    var el = this.page.refs[ref].getDOMNode();
    var type = el.getAttribute('type') || el.getAttribute('data-type');
    if (type && type.match(/checkbox/i)) {
      return el.checked;
    } else if (type && type.match(/radio/i)) {
      var children = el.getElementsByTagName('input');
      for (var i=0; i<children.length; i++) {
        if (children[i].checked) {
          return children[i].value;
        }
      }
    } else {
      return this.page.refs[ref].getDOMNode().value;
    }
  },

  madeChoice: function(key) {
    return this._choices.indexOf(key) >= 0;
  },

  saveChoice: function(choice) {
    this._choices.push(choice);
  },
  
  save: function() {
    try {
      var out = {};
      _.each(this, function(value, key) {
        if (key !== 'page') {
          out[key] = value;
        }
      });
      localStorage.setItem('book', JSON.stringify(out));
    } catch (e) {
      console.log(e);
    }
  },

  startWithCap: function(val) {
    return val.substring(0, 1).toUpperCase() + val.substring(1);
  },

  genderRef: function(key, ex) {
    if (!ex) {
      ex = key;
      key = 'gender';
    }

    var gender = this[key];
    var entries = {
      male: {
        'he': 'he',
        'she': 'he',
        'his': 'his',
        'hers': 'his',
        'her\'s': 'his',
        'him': 'him',
        'her': 'her',
        'male': 'male',
        'female': 'male'
      }, female: {
        'he': 'she',
        'she': 'she',
        'his': 'her',
        'hers': 'hers',
        'her\'s': 'her\'s',
        'him': 'her',
        'her': 'her',
        'male': 'female',
        'female': 'female'
      }
    };
    if (gender) {
      return entries[gender][ex];
    }
  }
});
  
Context.restore = function() {
  try {
    var data = localStorage.getItem('book');
    if (data) {
      data = JSON.parse(data);
      var context = new Context();
      _.extend(context, data);
      return context;
    }
  } catch (e) {}
};

Context.clear = function() {
  try {
    localStorage.removeItem('book');
  } catch (e) {}
};
