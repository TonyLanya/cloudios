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

class SignUpPage extends Component {
    constructor() {
        super();
        this.state = {
            redirectToReferrer: false,
            first : '',
            last : '',
            email : '',
            password: '',
            password2: '',
            error: ''
        };
    }

    componentDidMount() {
        if (this.props.authenticated === true) {
            return this.props.history.push('/');
        }
        document.title = 'Adnroid & IOS store - Register';
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({ error: '' });

        if ( this.state.email == '' ) {
            this.setState({ error: 'please input email' });
            return;
        }

        if ( this.state.first == '' ) {
            this.setState({ error: 'please input first name' });
            return;
        }

        if ( this.state.last == '' ) {
            this.setState({ error: 'please input last name' });
            return;
        }

        if ( this.state.password == '' ) {
            this.setState({ error: 'please input password' });
            return;
        }

        if ( this.state.password !== this.state.password2 ) {
            this.setState({ error: 'password not match' });
            return;
        }
        var payload={
            "first_name":this.state.first,
            "last_name":this.state.last,
            "email":this.state.email,
            "password":this.state.password
        }
        axios.post(apiBaseUrl+'register', payload)
        .then( response => {
            if ( response.data.msg === 'user registered sucessfully' ) {
                alert('user registered sucessfully')
                return this.props.history.push('/login');
            } else {
                this.setState({ error: response.data.msg });
            }
        }).catch( error => {
            this.setState({ error: 'System error' });
            console.log(error);
        });
    }

    handleLogin = () => {
        return this.props.history.push('/login');
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
                        Register
                        <MuiThemeProvider>
                        <div>
                            <TextField
                            hintText="Enter your first name"
                            floatingLabelText="First name"
                            onChange = {(event,newValue)=>this.setState({first: newValue, error: ''})}
                            />
                            <br/>
                            <TextField
                            hintText="Enter your last name"
                            floatingLabelText="Last name"
                            onChange = {(event,newValue)=>this.setState({last: newValue, error: ''})}
                            />
                            <br/>
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
                            <TextField
                                type="password"
                                hintText="Retype your Password"
                                floatingLabelText="ReType"
                                onChange = {(event,newValue) => this.setState({password2: newValue, error: ''})}
                                />
                            <br/>
                            <br/>
                            <small className="error-message" data-test="error">
                                {this.state.error && this.state.error}
                            </small>
                            <RaisedButton label="SignUp" type="Submit" primary={true} style={style} />
                            <br/>
                            <RaisedButton label="login" primary={true} style={style} onClick={this.handleLogin} />
                        </div>
                        </MuiThemeProvider>
                    </form>
                </div>
            </div>
        );
    }
}

const style = {
  margin: 15,
};

export default SignUpPage;