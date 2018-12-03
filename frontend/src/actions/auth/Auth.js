
import axios from 'axios';

var apiBaseUrl = "http://106.14.134.55:4000/api/";

export default class Auth {

  constructor() {
    this.signin = this.signin.bind(this);
    this.signout = this.signout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  signin(username, password) {
    return new Promise((resolve, reject) => {
        // var self = this;
        var payload={
        "userid":username,
        "password":password,
        "role":"student"
        }
        axios.post(apiBaseUrl+'login', payload)
        .then(function (response) {
            console.log(response);
            // this.setSession(authResult);
            return response;
            // if(response.data.code == 200){
            // console.log("Login successfull");
            // var uploadScreen=[];
            // uploadScreen.push(<UploadPage appContext={self.props.appContext} role={self.state.loginRole}/>)
            // self.props.appContext.setState({loginPage:[],uploadScreen:uploadScreen})
            // }
            // else if(response.data.code == 204){
            // console.log("Username password do not match");
            // alert(response.data.success)
            // }
            // else{
            // console.log("Username does not exists");
            // alert("Username does not exist");
            // }
        })
        .catch(function (error) {
            console.log(error);
            return reject(error);
        });
    //   this.auth0.client.login(
    //     { realm: params.realm, username, password },
    //     (err, authResult) => {
    //       if (err) {
    //         console.log(err);
    //         return reject(err);
    //       }
    //       this.setSession(authResult);
    //       return resolve();
    //     }
    //   );
    })
  }

  signout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  }

  handleAuthentication() {
      return ;
    // return new Promise((resolve, reject) => {
    //   this.auth0.parseHash((err, authResult) => {
    //     if (authResult && authResult.accessToken && authResult.idToken) {
    //       this.setSession(authResult);
    //       return resolve();
    //     } else if (err) {
    //       console.log(err);
    //       return reject(err);
    //     }
    //   });
    // })
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

}
