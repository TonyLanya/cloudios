import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';
var request = require('superagent');

class HomePage extends Component {
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

    onGotoItem = (index) => {
        this.props.history.push('/' + this.state.apps[index].applinkid);
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
                                <div className="app-item"  key={index} onClick={() => this.onGotoItem(index)}>
                                    <div className="app-image">
                                        <img width="50" src={app.appicon}/>
                                    </div>
                                    <div className="app-title">
                                        {app.appname}
                                    </div>
                                    <div className="app-platform">
                                        {app.platform}
                                    </div>
                                    <div className="app-created">
                                        <p style={{ marginBottom: "0px" }}>Created Time</p>
                                        <p style={{ margin: "0px", fontSize: "12px" }}>{app.created}</p>
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