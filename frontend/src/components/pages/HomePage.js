import React, { Component } from 'react';
import NavNew from './NavNew';
import { connect } from 'react-redux';
import '../../styles/customstyle.css';
import * as actions from '../../actions/auth';

class HomePage extends Component {
    componentWillMount() {
        document.title = 'Adnroid & IOS store - Home';
        // empty for now...
    }

    render() {
        return (
            <div>
                <div className="container">
                    <NavNew />
                </div>
                <div className="main">
                    <div className="content">
                        <p className="welcome-title">
                            Welcome to our service
                        </p>
                        <p className="welcome-content">
                            Enjoy your life
                        </p>
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

// export default HomePage;
export default connect(mapStateToProps, actions)(HomePage);