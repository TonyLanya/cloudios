import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import './App.css';
import LoginScreen from './Loginscreen';
class App extends Component {
  constructor(props){
    super(props);
    this.state={
      loginPage:[],
      uploadScreen:[]
    }
  }
  componentWillMount(){
    // var loginPage =[];
    // loginPage.push(<LoginScreen appContext={this}/>);
    // this.setState({
    //               loginPage:loginPage
    //                 })
  }
  render() {
    return (
      <div className="App">
        Welcome
      </div>
    );
  }
}

export default App;
