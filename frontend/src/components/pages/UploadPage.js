import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dropzone from 'react-dropzone';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import loadingImage from '../../../public/images/loading.gif';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
var request = require('superagent');
const PkgReader = require('reiko-parser');

class UploadPage extends Component {
    constructor(props) {
        super(props);
        this.state = {    
            draweropen: false,
            filesToBeSent: [],
            filesPreview: [],
            loading: false,
            loadingmessage: '',
            selected: false,
            appres: null,
            applinkid: '',
            role: 'Android',
            percent: 0,
        }
    }

    componentWillMount() {
        document.title = 'Adnroid & IOS store - Upload';
    }

    onSubmit = () => {
    }

    /*
      Function:toggleDrawer
      Parameters: event
      Usage:This fxn is used to close the drawer when user clicks anywhere on the 
      main div
      */
    handleDivClick = (event) => {
      // console.log("event",event);
      if(this.state.draweropen){
        this.setState({draweropen:false})
      }
    }
    /*
    Function:onDrop
    Parameters: acceptedFiles, rejectedFiles
    Usage:This fxn is default event handler of react drop-Dropzone
    which is modified to update filesPreview div
    */
    onDrop(acceptedFiles) {
        // this.setState({ loading: true, loadingmessage: 'please wait a moment...' });
        console.log(acceptedFiles);
        const currentFile = acceptedFiles[0];
        const myFileItemReader = new FileReader();
        myFileItemReader.addEventListener("load", () => {
            console.log(myFileItemReader.result);
        }, false);
        myFileItemReader.readAsDataURL(currentFile);
        // acceptedFiles[0].email = this.props.email;
        // console.log(acceptedFiles);
        // if (acceptedFiles[0].type == 'application/x-itunes-ipa') {
        //     var req = request.post(`${global.baseUrl}analyseios`);
        // } else if (acceptedFiles[0].type == 'application/vnd.android.package-archive') {
        //     var req = request.post(`${global.baseUrl}analyseapk`);
        // } else {
        //     alert("Please upload correct file");
        //     window.location.reload();
        // }
        // req.attach(acceptedFiles[0].name,acceptedFiles[0]).field('email', this.props.email);
        // req.on('progress', function(e) {
        //     console.log('Progress', e.percent);
        //     this.setState({percent: e.percent.toFixed(0)});
        //   }.bind(this));
        // req.end( (err,res) => {
        //     if(err){
        //         this.setState({ loading: false, selected: true });
        //     } else {
        //         console.log(res.body);
        //         console.log(res.body.data);
        //         if (res.body.msg == 'apk analyse sucessfully') {
        //             this.setState({ appres: res.body.data });
        //             // var bundleID = res.body.data.appid;
        //             // bundleID = bundleID.replace("com.", "");
        //             // bundleID = bundleID.replace(".", "");
        //             var bundleID = res.body.data.applinkid;
        //             this.setState({ applinkid: bundleID });
        //             this.setState({ loading: false, selected: true });
        //         } else if (res.body.msg == 'ipa analyse sucessfully') {
        //             this.setState({ appres: res.body.data });
        //             // var bundleID = res.body.data.appid;
        //             // bundleID = bundleID.replace("com.", "");
        //             // bundleID = bundleID.replace(".", "");
        //             var bundleID = res.body.data.applinkid;
        //             this.setState({ applinkid: bundleID });
        //             this.setState({ loading: false, selected: true });
        //         } else if (res.body.msg == 'cannot rename') {
        //             alert("Sorry unexpected error");
        //             window.location.reload();
        //         } else if (res.body.msg == 'app already published') {
        //             alert("app already published");
        //             // var bundleId = res.body.applinkid;
        //             // this.props.history.push('/' + bundleId);
        //             this.props.history.push('/myapps');
        //         } else if (res.body.msg == 'cannot remove old version') {
        //             alert("Sorry cannnot update version right now. Try again later.");
        //             window.location.reload();
        //         } else if (res.body.msg == 'Email not found') {
        //             alert("Please register with your email first");
        //             window.location.reload();
        //         } else {
        //             alert("Please upload correct file");
        //             window.location.reload();
        //         }
        //     }
        // });
    }

    getminVersion = () => {
        return parseFloat(this.state.appres.appminversion).toFixed(1);
    }

    onPublish = () => {
        this.setState({ loading: true, loadingmessage: 'please wait a moment...' });
        // var postform = this.state.appres;
        // postform["applinkid"] = this.state.applinkid;
        request
            .post(`${global.baseUrl}publishapp`)
            .send({ appinfo : this.state.appres, email: this.props.email })
            .set('Accept', 'application/json')
            .then(res => {
                console.log(res);
                if (res.body.msg == 'success update version') {
                    // this.props.history.push('/' + this.state.applinkid);
                    this.props.history.push('/myapps');
                } else if (res.body.msg == 'already updated') {
                    // this.props.history.push('/' + this.state.applinkid);
                    this.props.history.push('/myapps');
                } else if (res.body.msg == 'success publish') {
                    // this.props.history.push('/' + this.state.applinkid);
                    this.props.history.push('/myapps');
                } else {
                    alert(res.body.msg);
                    window.location.reload();
                }
            });
    }

    handleSelectRole = (event) => {
        console.log(event.target.className);
        if (event.target.className.indexOf('apple') != -1) {
            this.setState({ role: 'iOS' });
        } else {
            this.setState({ role: 'Android'});
        }
    }

    onView = () => {
        alert('VIEW');
    }

    render() {
        return (
            <div>
                <div className="container">
                    <NavNew />
                </div>
                <div className="main">
                <div className="content">
                { this.state.loading ? (
                    <div>
                        <div>
                            { this.state.loadingmessage }
                        </div>
                        {/* <img src={loadingImage}/> */}
                        <div style={{ width: "30%", margin: "auto" }}>
                            <CircularProgressbar
                                percentage={this.state.percent}
                                text={`${this.state.percent}%`}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        { !this.state.selected ? (
                        <div onClick={(event) => this.handleDivClick(event)}>
                            <center>
                            <div className="selectRole" onClick={(event) => this.handleSelectRole(event)}>
                                <div className={ this.state.role === 'iOS' ? 'active selectios' : 'selectios'} >
                                    <i className="fa fa-apple"></i>
                                </div>
                                <div className={ this.state.role === 'Android' ? 'active selectandroid' : 'selectandroid'} >
                                    <i className="fa fa-android"></i>
                                </div>
                            </div>
                            <div>
                                You can upload files at a time since you are
                            </div>

                            <Dropzone onDrop={(files) => this.onDrop(files)}>
                                <div>Try dropping some files here, or click to select files to upload.</div>
                            </Dropzone>
                            <div>
                            {this.state.filesPreview}
                            </div>
                            </center>
                        </div> ) : (
                            <div>
                                <div className="appcontainer">
                                    { this.state.appres && this.state.appres.appicon && (
                                        <div className="appicon">
                                            <img width="100" src={this.state.appres.appicon} />
                                            { this.state.appres.platform === 'iOS' ? (
                                                <div>
                                                    { this.state.appres.appname }
                                                </div>
                                            ) : (
                                                <div>
                                                    { this.state.appres.appname[0] }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    { this.state.appres && (
                                        <div className="appdetails">
                                            <div className="appmoredetails">
                                                <span className="applinkurl">
                                                    http://106.14.134.55:3000/{ this.state.applinkid }
                                                </span>
                                                <span>
                                                    <span className="appcloudimage">
                                                        <i className="fa fa-cloud-download"></i>
                                                    </span>
                                                    <span className="appdownload">
                                                        22
                                                    </span>
                                                </span>
                                                <span>
                                                    { this.state.appres.platform }
                                                </span>
                                                <span>
                                                    <span className="bundle">
                                                        BundleID
                                                    </span>
                                                    <span className="appbundle">
                                                        { this.state.appres.appid }
                                                    </span>
                                                </span>
                                                <span>
                                                    Over
                                                    {' '}
                                                    { this.state.appres.platform }
                                                    {' '}
                                                    { this.getminVersion() }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    { this.state.appres && (
                                        <div className="actioncontainer">
                                            <div className="actionupload" onClick={this.onPublish}>
                                                <i className="fa fa-cloud-upload" style={{ marginRight: '3px' }}></i>
                                                PUBLISH
                                            </div>
                                            <div className="actionview" onClick={this.onView}>
                                                <i className="fa fa-cloud-upload" style={{ marginRight: '3px' }}></i>
                                                VIEW
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="appbuilddetails">
                                    <p>
                                        Build version { this.state.appres.appversionname } (Build { this.state.appres.appversioncode})
                                    </p>
                                    <p>
                                        <i className="fa fa-calendar"></i>
                                        { this.state.appres.created }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { error, timestamp, forgotMsg, loading, authenticated } = state.auth;
    const email = state.user.email;
    return {
        error,
        timestamp,
        forgotMsg,
        loading,
        authenticated,
        email
    };
}

// export default UploadPage;
export default connect(mapStateToProps, actions)(UploadPage);