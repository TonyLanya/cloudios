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
        }
    }

    componentWillMount() {
        document.title = 'Adnroid & IOS store - Upload';
        // empty for now...
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
    onDrop(acceptedFiles, rejectedFiles) {
        this.setState({ loading: true, loadingmessage: 'please wait a moment...' });
        if (this.state.role === 'Android') {
            var req = request.post(`${global.baseUrl}analyseapk`);
        } else {
            var req = request.post(`${global.baseUrl}analyseios`);
        }
        req.attach(acceptedFiles[0].name,acceptedFiles[0]);
        req.end( (err,res) => {
            if(err){
                this.setState({ loading: false, selected: true });
            } else {
                console.log(res.body);
                console.log(res.body.data);
                if (res.body.msg == 'apk analyse sucessfully') {
                    this.setState({ appres: res.body.data });
                    var bundleID = res.body.data.appid;
                    bundleID = bundleID.replace("com.", "");
                    bundleID = bundleID.replace(".", "");
                    this.setState({ applinkid: bundleID });
                    this.setState({ loading: false, selected: true });
                } else if (res.body.msg == 'ipa analyse sucessfully') {
                    this.setState({ appres: res.body.data });
                    var bundleID = res.body.data.appid;
                    bundleID = bundleID.replace("com.", "");
                    bundleID = bundleID.replace(".", "");
                    this.setState({ applinkid: bundleID });
                    this.setState({ loading: false, selected: true });
                } else if (res.body.msg == 'cannot rename') {
                    alert("Sorry unexpected error");
                    window.location.reload();
                } else if (res.body.msg == 'app already published') {
                    alert("app already published");
                    var bundleId = res.body.bundleid;
                    this.props.history.push('/' + bundleId);
                } else if (res.body.msg == 'cannot remove old version') {
                    alert("Sorry cannnot update version right now. Try again later.");
                    window.location.reload();
                } else {
                    alert("Please upload correct file");
                    window.location.reload();
                }
            }
        });
    }

    getminVersion = () => {
        return parseFloat(this.state.appres.appminversion).toFixed(1);
    }

    onPublish = () => {
        this.setState({ loading: true, loadingmessage: 'please wait a moment...' });
        var postform = this.state.appres;
        postform["applinkid"] = this.state.applinkid;
        request
            .post(`${global.baseUrl}publishapp`)
            .send({ appinfo : postform })
            .set('Accept', 'application/json')
            .then(res => {
            //    alert('yay got ' + JSON.stringify(res.body));
            //    this.setState({ loading: false, selected: false });
                console.log(res);
                this.props.history.push('/' + this.state.applinkid);
            });
        // var req = request.post(`${global.baseUrl}publishapp`);
        // req.end( (err,res) => {
        //     if (err) {
        //         console.log(err);
        //         this.setState({ loading: false, selected: false });
        //     } else {
        //         console.log("res", res);
        //         this.setState({ loading: false, selected: false });
        //     }
        // });
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
                        <img src={loadingImage}/>
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
                                                    https://my.com/{ this.state.applinkid }
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
    return {
        error,
        timestamp,
        forgotMsg,
        loading,
        authenticated
    };
}

// export default UploadPage;
export default connect(mapStateToProps, actions)(UploadPage);