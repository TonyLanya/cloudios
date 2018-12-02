import React, { Component } from 'react';
import NavNew from './NavNew';
import loadingImage from '../../../public/images/loading.gif';
import RaisedButton from 'material-ui/RaisedButton';
var request = require('superagent');
var QRCode = require('qrcode.react');
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import RNFS from 'react-native-fs';
var platform = require('platform');
var Axios = require('axios');

class DownAppPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            loadingmessage: 'please wait a moment...',
            error: '',
            applink: '',
            appres: null,
            downloading: false,
            progress: null,
            link: ''
        };
    }

    componentDidMount() {
        alert(platform.os.family);
        document.title = 'Adnroid & IOS store - Down APP';
        this.setState({ applink: this.props.match.params.applink });
        request
            .post(`${global.baseUrl}getappinfo`)
            .send({ applink : this.props.match.params.applink, platform : platform.os.family })
            .set('Accept', 'application/json')
            .then(res => {
                if (res.body.data.length < 1) {
                    alert("No available app on your device");
                    this.props.history.push('/');
                    this.setState({ loading: false });
                }
                this.setState({ appres: res.body.data });
                if (platform.os.family == 'iOS') {
                    var templink = "itms-services://?action=download-manifest&url=http://47.100.36.49:4000/api/" + this.props.match.params.applink + "?platform=iOS";
                    this.setState({ link: templink });
                } else if (platform.os.family == 'Android') {
                    var templink = "http://47.100.36.49:4000/api/" + this.props.match.params.applink + "?platform=Android";
                    this.setState({ link: templink });
                }
                console.log(this.state.appres);
                this.setState({ loading: false });
            }).catch( err => {
                console.log(err);
                this.props.history.push('/');
            });
    }

    handleClick = (event) => {
        event.preventDefault();
        this.setState({ downloading: true});
        const url = `${global.baseUrl}${this.state.applink}?platform=${platform.os.family}`;
        alert(url);
        if (platform.os.family == 'Android') {
            // const path = RNFS.DocumentDirectoryPath + '/' + this.props.match.params.applink + '.apk';
        }
        // if (platform.os.family == 'Android') {
        //     const path = RNFS.DocumentDirectoryPath + '/' + this.props.match.params.applink + '.apk';
        //     var download = RNFS.downloadFile({
        //         fromUrl: url,
        //         toFile: path,
        //         progress: res => {
        //             this.setState({ progress: (res.bytesWritten / res.contentLength).toFixed(2) });
        //             console.log((res.bytesWritten / res.contentLength).toFixed(2));
        //         },
        //         progressDivider: 1
        //     });
        //     download.promise.then(result => {
        //         if(result.statusCode == 200){
        //             this.setState({ progress: null });
        //             this.setState({ downloading: false });
        //         } else {
        //             this.setState({ downloading: false });
        //         }
        //     });
        // }
        // window.open(`${global.baseUrl}${this.state.applink}?platform=${platform.os.family}`, "_blank");
    }

    render() {
        return (
            <div className="container">
                <div className="downmain">
                    <div className="down-container">
                    { this.state.loading ? (
                        <div>
                            <div>
                                { this.state.loadingmessage }
                            </div>
                            <img src={loadingImage}/>
                        </div>
                    ) : (
                        <div>
                        { (this.state.appres && this.state.appres.length) > 0 && (
                            this.state.appres.map((appitem, index) => (
                                <div className="app-brief">
                                    <div>
                                        {appitem.platform}
                                    </div>
                                    <div className="icon-container">
                                        <div>
                                            { appitem && appitem.appicon && (
                                                <img width="100" src={appitem.appicon}/>
                                            )}
                                        </div>
                                        <div>
                                        <QRCode value={"http://47.100.36.49:3000/"+ this.state.applink}/>
                                        </div>
                                        {/* { (platform.os.family == 'Android') && (
                                            (this.state.downloading) ? (
                                                <div>
                                                    Downloading.....
                                                    {this.state.progress}{' '}Bytes downloaded.
                                                </div>) : (
                                            <MuiThemeProvider>
                                                <RaisedButton label="Download" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
                                            </MuiThemeProvider>
                                        ))} */}
                                        { (platform.os.family == 'Android') && (
                                            <div>
                                                { this.state.link != '' && (
                                                <a href={this.state.link}>Download</a>
                                                )}
                                            </div>
                                        )}
                                        { (platform.os.family == 'iOS') && (
                                            <div>
                                                { this.state.link != '' && (
                                                <a href={this.state.link}>Download</a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <h1 className="name">
                                        <span className="icon-wrap">
                                            {appitem.appname}
                                        </span>
                                    </h1>
                                    <p className="scan-tips">
                                        Scan the qrcode to download
                                        <br/>
                                        Open the url on your phone: http://47.100.36.49:3000/{this.state.applink}
                                    </p>
                                    <div className="release-info">
                                        <p>
                                            {appitem.appversionname} (Build {appitem.appversioncode})
                                            <br/>
                                            Updated at: {appitem.modified}
                                        </p>
                                    </div>

                                </div>
                            ))
                        )}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    margin: 15,
  };
export default DownAppPage;