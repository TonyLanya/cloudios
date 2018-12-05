import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';
import Dropzone from 'react-dropzone';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
var request = require('superagent');

class Editapppage extends Component {
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
        document.title = 'Adnroid & IOS store - Edit App';
        this.setState({ loading: true});
        request
        .post(`${global.baseUrl}getappinfo`)
        .send({ applink : this.props.match.params.applink })
        .set('Accept', 'application/json')
        .then(res => {
            if (res.body.data.length < 1) {
                alert("No such app");
                this.props.history.push('/');
                this.setState({ loading: false });
            }
            console.log(res.body.data);
            this.setState({ applinkid: this.props.match.params.applink });
            this.setState({ loading: false, selected: true });
            this.setState({ loading: false, appres: res.body.data[0] });
        }).catch( err => {
            alert("No such app");
            console.log(err);
            this.props.history.push('/');
        });
    }

    getminVersion = () => {
        return parseFloat(this.state.appres.appminversion).toFixed(1);
    }

    render() {
        return (
            <div>
                <div className="container">
                    <NavNew />
                </div>
                <div className="main">
                <div className="content">
                    <div>
                        { this.state.appres && (
                        <div>
                            <div className="appcontainer">
                                { this.state.appres.appicon && (
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
                                <div className="appdetails">
                                    <div className="appmoredetails">
                                        <span className="applinkurl">
                                            http://localhost:3000/{ this.state.applinkid }
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

export default connect(mapStateToProps, actions)(Editapppage);