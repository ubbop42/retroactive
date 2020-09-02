import React, { Component } from 'react';
import './App.css';
import {lighttheme, darktheme} from './theme';
import { MuiThemeProvider } from 'material-ui/styles';
import RetroList from './components/RetroList';
import * as firebase from 'firebase';
import {firebaseConfig} from './constants'
import GoogleButton from 'react-google-button'
import {Card,CardContent ,LinearProgress, Snackbar, Fade} from '@material-ui/core'

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      loading: true,
      user: null,
      error: null,
      isDarkTheme: false,
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    firebase.auth().onAuthStateChanged((user) => {
      if(user){
        this.setState({
          user: user,        
          loading: false,
        });
          let newUserRef = firebase.database().ref('users/' + user.uid);
          newUserRef.set({
              name: user.displayName,
              email: user.email,
              id: user.uid,
          });
    } else{
      this.setState({
        user: null,        
        loading: false,
      });
    }
    });
    this.login = this.login.bind(this);
    this.getHomePage = this.getHomePage.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
  }

  componentWillMount(){
    this.setTheme();
  }

  setTheme(){
    let temp = localStorage.getItem("isDarkTheme");
    if(temp != null) {
      if(temp === "true") {
        document.body.style.background = "#222222";
        this.setState({isDarkTheme: true})
      } else {
        document.body.style.background = "#ffffff";
        this.setState({isDarkTheme: false})
      }
    }
  }

  handleClose = () => {
    this.setState({ error: null });
  };

  handleChangeTheme = event => {
    localStorage.setItem('isDarkTheme', event.target.checked);
    this.setState({ isDarkTheme : event.target.checked});
    if(event.target.checked) {
      document.body.style.background = "#222222";
    } else {
      document.body.style.background = "#ffffff";
    }
  };

  render() {
    return (
      <div className="App">

      <MuiThemeProvider theme={this.state.isDarkTheme ? darktheme : lighttheme}>
        {this.state.user? this.getHomePage() : this.getLoginPage()} 
      </MuiThemeProvider>
      </div>
    );
  }

  login(){
    this.setState({
      loading: true,
    });
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider).then((result) => {
      if(result.user.email.endsWith('tribalscale.com')){
        this.setState({ 
          user: result.user, 
          loading: false });
        let newUserRef = firebase.database().ref('users/' + result.user.uid)
        newUserRef.set({
            name: result.user.displayName,
            email: result.user.email,
            id: result.user.uid,
        });
      } else{
        this.setState({
          loading: false,
          error: "invalid User. Use your TribalScale Email",
        });
      }
    }).catch((error) => {
      this.setState({
        loading: false,
        error: error.message,
      });
    });
  }

  getHomePage(){
    
    return(
    <div>
      <RetroList user={this.state.user} isDarkTheme={this.state.isDarkTheme} handleChangeTheme={this.handleChangeTheme}/>
    </div>
    );
  }

  getLoginPage(){
    return(
    <div className="login-page">
    <Card raised className="login-page-inner">
    <CardContent>
        <h1 className='login-title'><span role='img' aria-label='Happy Meh Sad'>😀 😐 ☹️</span></h1>
        { this.state.loading ? <LinearProgress /> : <GoogleButton onClick={this.login} aria-label="Login" className="login-button"/>}
      </CardContent>
    </Card>
    <Snackbar
          open={this.state.error}
          onClose={this.handleClose}
          transition={Fade}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.error}</span>}
        />
    </div>
    );
  }
}

export default App;
