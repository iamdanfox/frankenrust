var React = require('react');

var HelloMessage = React.createClass({displayName: "HelloMessage",
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});


var App = <HelloMessage name='Dan' />

module.exports = App;
