import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';
import 'font-awesome/css/font-awesome.min.css';
var request = require('superagent');

class MyappsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            apps: null
        };
    }
    componentWillMount() {
        document.title = 'Adnroid & IOS store - MyApps';
        // empty for now...
        this.setState({ loading: true});
        request
        .post(`${global.baseUrl}getapps`)
        .send({ email : this.props.email })
        .set('Accept', 'application/json')
        .then(res => {
            if (res.body.data.length < 1) {
                alert("No available app on your device");
                // this.props.history.push('/');
                this.setState({ loading: false });
            }
            console.log(res.body.data);
            this.setState({ loading: false, apps: res.body.data });
        }).catch( err => {
            console.log(err);
            this.props.history.push('/');
        });
    }

    onGotoView = (index) => {
        window.open('/' + this.state.apps[index].applinkid);
    }

    onGotoEdit = (index) => {
        this.props.history.push('/myapps/' + this.state.apps[index].applinkid);
    }

    render() {
        return (
            <div>
                <div className="container">
                    <NavNew />
                </div>
                <div className="main">
                    <div className="app-content">
                        <p className="app-header-title">
                            Your apps
                        </p>
                        <div className="app-container">
                        { this.state.apps && (
                            this.state.apps.map((app, index) => (
                                <div className="app-item"  key={index}>
                                    <div className="app-image" onClick={() => this.onGotoEdit(index)}>
                                        <img width="80" src={app.appicon}/>
                                    </div>
                                    <div className="app-title">
                                        {app.appname}
                                    </div>
                                    <div className="app-platform">
                                        {app.platform}
                                    </div>
                                    <div className="app-short">
                                        <div className="app-detail-header">
                                        short: 
                                        </div>
                                        <div className="app-detail-content" title={app.applinkid}>
                                        http://localhost:3000/{app.applinkid}
                                        </div>
                                    </div>
                                    <div className="app-package">
                                        <div className="app-detail-header">
                                        PackageName: 
                                        </div>
                                        <div className="app-detail-content" title={app.appid}>
                                        {app.appid}
                                        </div>
                                    </div>
                                    <div className="app-latest">
                                        <div className="app-detail-header">
                                        Lastest: 
                                        </div>
                                        <div className="app-detail-content">
                                        {app.appversionname}{' ( Build '}{app.appversioncode}{' )'}
                                        </div>
                                    </div>
                                    <div className="app-created">
                                        <div className="app-detail-header">
                                        CreatedTime: 
                                        </div>
                                        <div className="app-detail-content" title={app.created}>
                                        {app.created}
                                        </div>
                                    </div>
                                    <div className="app-action">
                                    <div className="button" onClick={() => this.onGotoEdit(index)}>
                                        <i className="fa fa-pencil" style={{ fontSize: '14px', marginRight: '3px' }}></i>
                                        Edit
                                    </div>
                                    <div className="button" onClick={() => this.onGotoView(index)}>
                                        <i className="fa fa-eye" style={{ fontSize: '14px', marginRight: '3px' }}></i>
                                        Preview
                                    </div>
                                    {/* <div className="button">
                                        <i className="fa fa-trash" style={{ fontSize: '14px', marginRight: '3px' }}></i>
                                    </div> */}
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

const style = {
    margin: 15,
};

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

export default connect(mapStateToProps, actions)(MyappsPage);