var React = require('react');
var FFIDemo = require('./FFIDemo.js');

var HelloMessage = React.createClass({
  displayName: "HelloMessage",

  getInitialState: function() {
    return {}
  },

  callRust: function() {
    this.setState({result:FFIDemo()});
  },

  render: function() {
    return (
      <div>
        <h1>Hello {this.props.name}</h1>
        <button onClick={this.callRust}>Call Rust</button>
        {this.state.result && <span>Result: {this.state.result}</span>}
      </div>
    );
  }
});


var App = <HelloMessage name='Dan' />

module.exports = App;
