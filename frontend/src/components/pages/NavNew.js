import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import * as actions from '../../actions/auth';
import '../../styles/customstyle.css';
import { connect } from 'react-redux';
import Sidebar from "react-sidebar";
import 'font-awesome/css/font-awesome.min.css';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class MenuAppBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false,
      auth: true,
      anchorEl: null,
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  componentDidMount() {
  }

  handleChange = event => {
    this.setState({ auth: event.target.checked });
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleLogout = () => {
      this.props.signoutUser();
      this.props.history.push('/login');
  }

  sideContent() {
    return (
      <div className="bm-menu">
        <nav className="bm-item-list" style={{height: '100%'}}>
          <a href="/upload" className="bm-item" style={{display: 'block', outline: 'none'}}>
            <i className="fa fa-fw fa-star-o" style={{ fontSize: '1.7em' }}></i>
            <span>UPLOAD</span>
          </a>
        </nav>
      </div>
    );
  }

  render() {
    // const { classes } = this.props;
    const { auth, anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div style={{ flexGrow: '1' }}>
        <Sidebar
          sidebar={this.sideContent()}
          open={this.state.sidebarOpen}
          onSetOpen={this.onSetSidebarOpen}
          styles={{ sidebar: { background: "white", width: "300px" } }}
        >
          <AppBar position="static">
            <Toolbar>
              {this.props.authenticated && (
                <IconButton style={{ marginLeft: '-12', marginRight: '20' }} color="inherit" aria-label="Menu">
                  <MenuIcon onClick={() => this.onSetSidebarOpen(true)} />
                </IconButton>
              )}
              <Typography variant="h6" color="inherit" style={{ textAlign: 'center', flexGrow: '1' }}>
                ANDROID & IOS STORE
              </Typography>
              {this.props.authenticated && (
                <div>
                  <IconButton
                    aria-owns={open ? 'menu-appbar' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={this.handleClose}
                  >
                    {/* <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                    <MenuItem onClick={this.handleClose}>My account</MenuItem> */}
                    <MenuItem onClick={this.handleLogout}>Log Out</MenuItem>
                  </Menu>
                </div>
              )}
            </Toolbar>
          </AppBar>
          {/* <button onClick={() => this.onSetSidebarOpen(true)}>
            Open sidebar
          </button> */}
        </Sidebar>
      </div>
    );
  }
}

// MenuAppBar.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

// export default withStyles(styles)(MenuAppBar);


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
export default connect(mapStateToProps, actions)(MenuAppBar);