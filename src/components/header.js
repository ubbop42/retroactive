import React, { Component } from 'react';
import {AppBar, Toolbar, IconButton, Switch, Menu, MenuItem} from '@material-ui/core';
import {Typography}from '@material-ui/core';
import { withStyles } from 'material-ui/styles';
import * as firebase from 'firebase';
import AccountCircle from 'material-ui-icons/AccountCircle';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  userContainer: {
    display: 'inherit'
  },
  avatar: {
    marginRight : '10px',
  }
};
class CustomHeader extends Component {

  constructor(props){
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  logout(){
    firebase.auth().signOut();
  }
  render() {
    const {classes } = this.props;
    const { anchorEl} = this.state;
    const open = Boolean(anchorEl);
    return (
      <div className="">
        <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography align='left' variant="title" color="inherit" className="">
          <span role='img' aria-label='Happy Meh Sad'>😀 😐 ☹️</span>
          </Typography>
          {this.props.user ? 
          <div className="">              
            <div>
              <IconButton aria-owns={open ? 'menu-appbar' : null} aria-haspopup="true" onClick={this.handleMenu} color="inherit">
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
                onClose={this.handleClose}>
                <MenuItem >{this.props.user.displayName}</MenuItem>
                <MenuItem>Dark Theme<Switch checked={this.props.isDarkTheme} onChange={this.props.handleChangeTheme}/></MenuItem>
                <MenuItem  onClick={() => {this.logout()}}>Logout</MenuItem>
              </Menu>
            </div>
          </div> : '' }
        </Toolbar>
      </AppBar>
    </div>
    );
  }
}

export default CustomHeader;




// WEBPACK FOOTER //
// ./src/components/Header.js