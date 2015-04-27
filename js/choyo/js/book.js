var React = require('react');

module.exports = {
  title: "Fancy Book",

  setup: function() {
    this.code = this.randomNumber(1000, 9999);
  },

  pages: {
    "main": {
      content: function() {
        return <p>My name is <input ref="name"/> and enter the code <b>{this.code}</b> <input ref="code"/></p>
      },
      choices: {
        "tyler": "HELLLOOOO",
        "2": "Look around",
        "3": function() {
          if (!this.foo) {
            return "Stay inside"
          }
        }
      },
      choiceMade: function(id) {
        var name = this.val('name');
        var code = this.val('code');
        if (this.code != code) {
          return "Sorry, you didn't get the code right";
        }
        if (!name) {
          return "Umm... what is your name?";
        }
        this.name = name;
      }
    },


    "2": {
      content: function() {
        return "Hello " + this.name
      },
      choices: {
        "3": "Ho hum",
        "4": function() {
          if (!this.tyler) {
            return "this won't show up"
          }
        }
      }
    },


    "3": {
      content: "THE END"
    },


    "tyler": {
      content: "This is the page content"
    }
  }
};
