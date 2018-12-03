import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Field, reduxForm } from "redux-form";
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { connect } from 'react-redux';
import axios from 'axios';
import * as actions from '../../../actions/auth';
import '../../../styles/customstyle.css';
import NavNew from './../NavNew';
import RaisedButton from 'material-ui/RaisedButton';

var apiBaseUrl = "http://106.14.134.55:4000/api/";

class userLogin extends Component {
    constructor() {
        super();
        this.state = {
            redirectToReferrer: false,
            email : '',
            password: '',
            error: ''
        };
    }

    componentDidMount() {
        if (this.props.authenticated === true) {
            return this.props.history.push('/');
        }
        document.title = 'Adnroid & IOS store - Login';
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({ error: '' });
        var payload={
            "email":this.state.email,
            "password":this.state.password
        }
        axios.post(apiBaseUrl+'login', payload)
        .then( response => {
            if ( response.data.success === 'login sucessfull' ) {
                this.props.signSuccess();
                return this.props.history.push('/');
            } else {
                // alert('failed');
                this.setState({ error: response.data.success });
            }
        }).catch( error => {
            this.setState({ error: 'System error' });
            console.log(error);
        });
    }

    handleSignup = () => {
        return this.props.history.push('/signup');
    }

    render() {
        const { from } = this.props.location.state || { from: {pathname: '/'} };
        const { redirectToReferrer } = this.state;


        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }

        return (
            <div>
                <NavNew />
                <div className="loginContainer">
                    <form onSubmit={this.handleSubmit}>
                        Login
                        <MuiThemeProvider>
                        <div>
                            <TextField
                            hintText="Enter your email address"
                            floatingLabelText="Email Address"
                            onChange = {(event,newValue)=>this.setState({email: newValue, error: ''})}
                            />
                            <br/>
                            <TextField
                                type="password"
                                hintText="Enter your Password"
                                floatingLabelText="Password"
                                onChange = {(event,newValue) => this.setState({password: newValue, error: ''})}
                                />
                            <br/>
                            <small className="error-message" data-test="error">
                                {this.state.error && this.state.error}
                            </small>
                            <RaisedButton label="Login" type="Submit" primary={true} style={style} />
                            <br/>
                            <RaisedButton label="Sign Up" primary={true} style={style} onClick={this.handleSignup} />
                        </div>
                        </MuiThemeProvider>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { error, timestamp, forgotMsg, loading, authenticated } = state.auth;
    return {
        error,
        timestamp,
        forgotMsg,
        loading,
        authenticated
    };
}

const style = {
  margin: 15,
};

// export default userLogin;
export default connect(mapStateToProps, actions)(userLogin);