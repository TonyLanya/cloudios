import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';
import { confirmAlert } from 'react-confirm-alert'; // Import
import green from '@material-ui/core/colors/green';
import Button from '@material-ui/core/Button';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import debounce from 'lodash/debounce';
var request = require('superagent');

const theme = createMuiTheme({
    palette: {
      primary: green,
    },
    typography: {
      useNextVariants: true,
    },
  });

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            apps: null,
            links: null,
            uploading: false,
            publishing: false,
            progress: 0,
            filename: '',
            newlink: false,
            validCreate: false,
            nlink: '',
            error: '',
        };
        this.checklink = debounce(this.onCheck, 250);
    }

    componentWillMount() {
        document.title = 'Adnroid & IOS store - Home';
        // empty for now...
        this.setState({ loading: true});
        request
        .post(`${global.baseUrl}getlinks`)
        .send({ email : this.props.email })
        .set('Accept', 'application/json')
        .then(res => {
            console.log(res.body);
            this.setState({ loading: false, links: res.body.res });
        }).catch( err => {
            console.log(err);
            // this.props.history.push('/');
        });
    }

    onRemove = (index) => {
        confirmAlert({
            title: '警告',
            message: '是否删除链接？',
            buttons: [
              {
                label: '是',
                onClick: () => {
                    request
                    .post(`${global.baseUrl}removelink`)
                    .send({ link : this.state.links[index].applinkid, email: this.props.email })
                    .set('Accept', 'application/json')
                    .then(res => {
                        console.log(res);
                        if (res.body.msg == 'success') {
                            NotificationManager.success('链接复制完了', '成功');
                            request
                            .post(`${global.baseUrl}getlinks`)
                            .send({ email : this.props.email })
                            .set('Accept', 'application/json')
                            .then(res => {
                                console.log(res.body);
                                this.setState({ links: res.body.res });
                            }).catch( err => {
                                console.log(err);
                                // this.props.history.push('/');
                            });
                            // this.props.history.push('/myapps');
                        } else {
                            // alert(res.body.msg);
                            NotificationManager.error('failed to remove', 'failed');
                            request
                            .post(`${global.baseUrl}getlinks`)
                            .send({ email : this.props.email })
                            .set('Accept', 'application/json')
                            .then(res => {
                                console.log(res.body);
                                this.setState({ links: res.body.res });
                            }).catch( err => {
                                console.log(err);
                                // this.props.history.push('/');
                            });
                        }
                    });
                }
              },
              {
                label: '否',
              }
            ]
          })
    }

    onPreview = (index) => {
        window.open("/" + this.state.links[index].applinkid);
    }

    copyToClipboard = (content) => {
        var textField = document.createElement('textarea')
        textField.innerText = content
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove()
    }

    onCopyurl = (index) => {
        this.copyToClipboard("http://106.14.134.55:3000/" + this.state.links[index].applinkid);
        NotificationManager.success('链接复制完了', '成功');
    }

    handleChange(selectorFiles, platform, index)
    {
        console.log(selectorFiles);
        if (platform == 'Android') {
            if (selectorFiles[0].type == 'application/vnd.android.package-archive') {
                this.setState({ uploading: true, filename: selectorFiles[0].name });
                var req = request.post(`${global.baseUrl}analyseapk`);
                req.attach(selectorFiles[0].name,selectorFiles[0]).field({'email': this.props.email, 'applinkid': this.state.links[index].applinkid});
                req.on('progress', function(e) {
                    console.log('Progress', e.percent);
                    this.setState({progress: e.percent.toFixed(0)});
                }.bind(this));
                req.end( (err,res) => {
                    if(err){
                        this.setState({ uploading: false });
                    } else {
                        console.log(res.body);
                        console.log(res.body.data);
                        if (res.body.msg == 'apk analyse sucessfully') {
                            this.setState({ publishing: true });
                            request
                            .post(`${global.baseUrl}publishapp`)
                            .send({ appinfo : res.body.data, email: this.props.email })
                            .set('Accept', 'application/json')
                            .then(res => {
                                console.log(res);
                                if (res.body.msg == 'success publish') {
                                    this.setState({ publishing: false, uploading: false});
                                    NotificationManager.success('链接复制完了', '成功');
                                    request
                                    .post(`${global.baseUrl}getlinks`)
                                    .send({ email : this.props.email })
                                    .set('Accept', 'application/json')
                                    .then(res => {
                                        console.log(res.body);
                                        this.setState({ loading: false, links: res.body.res });
                                    }).catch( err => {
                                        console.log(err);
                                        // this.props.history.push('/');
                                    });
                                    // this.props.history.push('/myapps');
                                } else {
                                    // alert(res.body.msg);
                                    this.setState({ publishing: false, uploading: false});
                                    NotificationManager.error('failed to publish', 'failed');
                                }
                            });
                            // this.setState({ appres: res.body.data });
                            // var bundleID = res.body.data.applinkid;
                            // this.setState({ applinkid: bundleID });
                            // this.setState({ loading: false, selected: true });
                        } else if (res.body.msg == 'cannot rename') {
                            this.setState({ uploading: false });
                            // alert("Sorry unexpected error");
                            // window.location.reload();
                        } else if (res.body.msg == 'app already published') {
                            this.setState({ uploading: false });
                            // alert("app already published");
                            // this.props.history.push('/myapps');
                        } else if (res.body.msg == 'cannot remove old version') {
                            this.setState({ uploading: false });
                            // alert("Sorry cannnot update version right now. Try again later.");
                            // window.location.reload();
                        } else if (res.body.msg == 'Email not found') {
                            alert("Please register with your email first");
                            this.setState({ uploading: false });
                            // window.location.reload();
                        } else {
                            alert("Please upload correct file");
                            this.setState({ uploading: false });
                            // window.location.reload();
                        }
                    }
                });
            } else {
                NotificationManager.error('Please select android file', 'failed');
            }
        } else {
            if (selectorFiles[0].type == 'application/x-itunes-ipa') {
                this.setState({ uploading: true, filename: selectorFiles[0].name });
                this.setState({ uploading: true });
                var req = request.post(`${global.baseUrl}analyseios`);
                req.attach(selectorFiles[0].name,selectorFiles[0]).field({'email': this.props.email, 'applinkid': this.state.links[index].applinkid});
                req.on('progress', function(e) {
                    console.log('Progress', e.percent);
                    this.setState({progress: e.percent.toFixed(0)});
                }.bind(this));
                req.end( (err,res) => {
                    if(err){
                        this.setState({ uploading: false });
                    } else {
                        console.log(res.body);
                        console.log(res.body.data);
                        if (res.body.msg == 'ipa analyse sucessfully') {
                            this.setState({ publishing: true });
                            request
                            .post(`${global.baseUrl}publishapp`)
                            .send({ appinfo : res.body.data, email: this.props.email })
                            .set('Accept', 'application/json')
                            .then(res => {
                                console.log(res);
                                if (res.body.msg == 'success publish') {
                                    this.setState({ publishing: false, uploading: false});
                                    NotificationManager.success('链接复制完了', '成功');
                                    request
                                    .post(`${global.baseUrl}getlinks`)
                                    .send({ email : this.props.email })
                                    .set('Accept', 'application/json')
                                    .then(res => {
                                        console.log(res.body);
                                        this.setState({ loading: false, links: res.body.res });
                                    }).catch( err => {
                                        console.log(err);
                                        // this.props.history.push('/');
                                    });
                                    // this.props.history.push('/myapps');
                                } else {
                                    // alert(res.body.msg);
                                    this.setState({ publishing: false, uploading: false});
                                    NotificationManager.error('failed to publish', 'failed');
                                }
                            });
                            // this.setState({ appres: res.body.data });
                            // var bundleID = res.body.data.applinkid;
                            // this.setState({ applinkid: bundleID });
                            // this.setState({ loading: false, selected: true });
                        } else if (res.body.msg == 'cannot rename') {
                            this.setState({ uploading: false });
                            // alert("Sorry unexpected error");
                            // window.location.reload();
                        } else if (res.body.msg == 'app already published') {
                            this.setState({ uploading: false });
                            // alert("app already published");
                            // this.props.history.push('/myapps');
                        } else if (res.body.msg == 'cannot remove old version') {
                            this.setState({ uploading: false });
                            // alert("Sorry cannnot update version right now. Try again later.");
                            // window.location.reload();
                        } else if (res.body.msg == 'Email not found') {
                            this.setState({ uploading: false });
                            // alert("Please register with your email first");
                            // window.location.reload();
                        } else {
                            alert("Please upload correct file");
                            this.setState({ uploading: false });
                            // window.location.reload();
                        }
                    }
                });
            } else {
                NotificationManager.error('Please select iOS file', 'failed');
            }
        }
    }

    onNewlink = () => {
        this.setState({ newlink: true });
    }

    onCreatelink = () => {
        var nlink = document.getElementById('nlink').value;
        if (nlink.length != 4) {
            this.setState({ validCreate: false, error: 'input 4 characters' });
        } else {
            request
            .post(`${global.baseUrl}createlink`)
            .send({ link : nlink, email: this.props.email })
            .set('Accept', 'application/json')
            .then(res => {
                console.log(res);
                if (res.body.msg == 'success') {
                    this.setState({ validCreate: false, newlink: false });
                    NotificationManager.success('New link created', 'Success');
                    request
                    .post(`${global.baseUrl}getlinks`)
                    .send({ email : this.props.email })
                    .set('Accept', 'application/json')
                    .then(res => {
                        console.log(res.body);
                        this.setState({ loading: false, links: res.body.res });
                    }).catch( err => {
                        console.log(err);
                        // this.props.history.push('/');
                    });
                } else if (res.body.msg == 'not available') {
                    this.setState({ validCreate: false, error: 'already exists' });
                } else {
                    this.setState({ validCreate: false });
                }
            });
            this.setState({ validCreate: false });
        }
    }

    onCloselink = () => {
        this.setState({ newlink: false });
    }

    onCheck = () => {
        this.setState({ error: '' });
        var nlink = document.getElementById('nlink').value;
        if (nlink.length != 4) {
            this.setState({ validCreate: false, error: 'input 4 characters' });
        } else {
            request
            .post(`${global.baseUrl}checklink`)
            .send({ link : nlink, email: this.props.email })
            .set('Accept', 'application/json')
            .then(res => {
                console.log(res);
                if (res.body.msg == 'available') {
                    this.setState({ validCreate: true });
                } else if (res.body.msg == 'not available') {
                    this.setState({ validCreate: false, error: 'already exists' });
                } else {
                    this.setState({ validCreate: false });
                }
            });
        }
    }

    render() {
        return (
            <div>
                <NotificationContainer/>
                <div className="container">
                    <NavNew />
                </div>
                { this.state.uploading && (
                <div className="uploading-container">
                    <div className="mid-Div">
                        <div className="uploading">
                            <div className="uploading-box uploading-file">
                                <p>
                                    Now uploading {this.state.filename}...
                                </p>
                            </div>
                            <div className="uploading-box uploading-progress">
                                <Progress percent={this.state.progress} />
                            </div>
                        </div>
                    </div>
                </div>
                )}
                { this.state.newlink && (
                <div className="newlink-container">
                    <div className="mid-Div">
                        <div className="newlink">
                            <a href="#" className="close-thik" onClick={() => this.onCloselink()}></a>
                            <div className="newlink-box newlink-file">
                                <p>
                                    Input your new link <span style={{color:'red'}}>{this.state.error}</span>
                                </p>
                            </div>
                            <div className="newlink-box newlink-content">
                                <div className="newlink-header">
                                    http://106.14.134.55:3000/
                                </div>
                                <input type="text" onChange={e => this.checklink(e)} id='nlink' maxLength='4' />
                            </div>
                            <div className="newlink-box newlink-action">
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary" className={theme.spacing.unit} style={{ width: '100%', height: '100%' }} disabled={!this.state.validCreate} onClick={() => this.onCreatelink()}>
                                    CREATE
                                    </Button>
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                <div className="main">
                    <div className="app-content">
                        <p className="app-header-title">
                            Your apps
                        </p>
                        <div className="app-newlink">
                        <MuiThemeProvider theme={theme}>
                            <Button variant="contained" color="primary" className={theme.spacing.unit} onClick={() => this.onNewlink()}>
                            新建下载链接
                            </Button>
                        </MuiThemeProvider>
                        </div>
                        <div className="app-container">
                        { this.state.links && (
                            this.state.links.map((link, index) => (
                                <div className="app-item"  key={index}>
                                    <a href="#" className="close-thik" onClick={() => this.onRemove(index)}></a>
                                    <div className="app-link" onClick={() => this.onCopyurl(index)}>
                                        <p title="Click to copy">
                                            http://106.14.134.55:3000/{link.applinkid}
                                        </p>
                                    </div>
                                    { link.Android.appid ? (
                                    <div className="app-android">
                                        <div className="platform">
                                        <p>
                                            安卓
                                        </p>
                                        </div>
                                        <div className="fileUpload btn btn-success">
                                            <span>Upload</span>
                                            <input type="file" className="upload" onChange={(e) => this.handleChange(e.target.files, 'Android', index) } />
                                        </div>
                                        <div className="container">
                                            <div className="img">
                                                <img src={link.Android.appicon} />
                                            </div>
                                            <div className="detail" title={link.Android.appname}>
                                            <p>
                                                {link.Android.appname}
                                            </p>
                                            <p title={link.Android.appid}>
                                                {link.Android.appid}
                                            </p>
                                            <p>
                                                {link.Android.appversionname}{' ( Build '}{link.Android.appversioncode}{' )'}
                                            </p>
                                            </div>
                                        </div>
                                    </div>
                                    ) : (
                                        <div className="app-android">
                                            <div className="platform">
                                            <p>
                                                安卓
                                            </p>
                                            </div>
                                            <div className="fileUpload btn btn-success">
                                                <span>Upload</span>
                                                <input type="file" className="upload" onChange={(e) => this.handleChange(e.target.files, 'Android', index) } />
                                            </div>
                                            <div className="container">
                                                <div className="img">
                                                </div>
                                                <div className="detail">
                                                <p>
                                                </p>
                                                <p>
                                                </p>
                                                <p>
                                                </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    { link.iOS.appid ? (
                                    <div className="app-ios">
                                        <div className="platform">
                                        <p>
                                            ios
                                        </p>
                                        </div>
                                        <div className="fileUpload btn btn-success">
                                            <span>Upload</span>
                                            <input type="file" className="upload" onChange={(e) => this.handleChange(e.target.files, 'iOS', index) } />
                                        </div>
                                        <div className="container">
                                            <div className="img">
                                                <img src={link.iOS.appicon} />
                                            </div>
                                            <div className="detail" title={link.iOS.appname}>
                                            <p>
                                                {link.iOS.appname}
                                            </p>
                                            <p title={link.iOS.appid}>
                                                {link.iOS.appid}
                                            </p>
                                            <p>
                                                {link.iOS.appversionname}{' ( Build '}{link.iOS.appversioncode}{' )'}
                                            </p>
                                            </div>
                                        </div>
                                    </div>
                                    ) : (
                                        <div className="app-ios">
                                            <div className="platform">
                                            <p>
                                                ios
                                            </p>
                                            </div>
                                            <div className="fileUpload btn btn-success">
                                                <span>Upload</span>
                                                <input type="file" className="upload" onChange={(e) => this.handleChange(e.target.files, 'iOS', index) } />
                                            </div>
                                            <div className="container">
                                                <div className="img">
                                                </div>
                                                <div className="detail">
                                                <p>
                                                </p>
                                                <p>
                                                </p>
                                                <p>
                                                </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="action-view">
                                        <MuiThemeProvider theme={theme}>
                                            <Button variant="contained" color="primary" className={theme.spacing.unit} onClick={() => this.onPreview(index)}>
                                            下载链接预览
                                            </Button>
                                        </MuiThemeProvider>
                                    </div>
                                </div>
                            ))
                        )}
                        </div>
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

// export default HomePage;
export default connect(mapStateToProps, actions)(HomePage);