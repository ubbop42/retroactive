
import React, { Component } from 'react';
import {Typography}from '@material-ui/core';
import {Button, Grid,List, ListItem, ListItemText, Toolbar, IconButton, LinearProgress,Checkbox,AppBar,Chip, Input, InputAdornment }  from '@material-ui/core';
import * as firebase from 'firebase';
import FloatingActionButtonZoom from './session'
import CustomHeader from './header'
import BackIcon from 'material-ui-icons/ArrowBack';
import SearchIcon from 'material-ui-icons/Search';
import {ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

class RetroList extends Component {

  constructor(props){
    super(props);
    this.retrosDatabaseRef = firebase.database().ref('retros/');
    this.todosDatabaseRef = firebase.database().ref('actionItems/');
    
    this.state = {
      input: '',
      activeRetros: [],
      deadRetros: [],
      filteredActiveRetros: [],
      filteredDeadRetros: [],
      actionItems: [],
      selectedRetro: null,
      loading: true,
    };
    this.updateInputValue = this.updateInputValue.bind(this);
    this.createRetro = this.createRetro.bind(this);
    this.getRetros = this.getRetros.bind(this);
    this.getRetroList = this.getRetroList.bind(this);
    this.selectRetro = this.selectRetro.bind(this);
    this.handleCompletedItem = this.handleCompletedItem.bind(this);
  }

  componentWillMount(){
    this.getRetros();
  }

  createRetro(){
    let date = new Date();
    let retroName = this.state.input ;
    let newRetroRef = this.retrosDatabaseRef.push();
    newRetroRef.set({
      name: retroName,
      active: true,
      id: newRetroRef.key,
      startTime: date.getTime(),
      user: this.props.user.displayName,
      email: this.props.user.email,
    });
    this.setState({
      input: '',
    });
  }

  updateInputValue(evt){
    this.setState({
      input: evt.target.value
    });
  }

  getRetros(){
    this.retrosDatabaseRef.orderByChild('active').equalTo(true).on('value', (snapshot) => {
      let array = []
      snapshot.forEach((childSnapshot) => {
        array.push(childSnapshot.val());
      });
      array.reverse();
      this.setState({
        activeRetros: array,
        filteredActiveRetros: array,
        loading: false,
      });
    });

    this.retrosDatabaseRef.orderByChild('active').equalTo(false).on('value', (snapshot) => {
      let array = []
      snapshot.forEach((childSnapshot) => {
        array.push(childSnapshot.val());
      });
      array.reverse();
      this.setState({
        deadRetros: array,
        filteredDeadRetros: array,
        loading: false,
      });
    });

    this.todosDatabaseRef.orderByChild('userId').equalTo(this.props.user.uid).on('value', (snapshot) => {
      let array = []
      snapshot.forEach((childSnapshot) => {
        array.push(childSnapshot.val());
      });
      array.reverse();
      this.setState({
        actionItems: array,
        loading: false,
      });
    }); 

  }

  selectRetro(retro){
    this.setState({
      selectedRetro: retro
    });
    firebase.database().ref('retros/' + retro.id + '/active').on('value', (snapshot) => {
    this.setState(prevState => ({
      selectedRetro: {
          ...prevState.selectedRetro,
          active: snapshot.val()
          }
      }))
    });
  }

  deselectRetro(){
    this.setState({
      selectedRetro: null
    });
  }

  handleCompletedItem(actionItem){
    let checkRef = firebase.database().ref('actionItems/' + actionItem.id + '/isDone');
    checkRef.transaction((value) => {
        return !value;
    });
  }

  toggleSession(){
    if(this.state.selectedRetro.active){
      firebase.database().ref('retroSessions/' + this.state.selectedRetro.id + '/happy').once('value', (snapshot) => {
        (firebase.database().ref('retros/' + this.state.selectedRetro.id + '/happyCount')).set(snapshot.numChildren());
      });
      firebase.database().ref('retroSessions/' + this.state.selectedRetro.id + '/meh').once('value', (snapshot) => {
        firebase.database().ref('retros/' + this.state.selectedRetro.id + '/mehCount').set(snapshot.numChildren());
      });
      firebase.database().ref('retroSessions/' + this.state.selectedRetro.id + '/sad').once('value', (snapshot) => {
        firebase.database().ref('retros/' + this.state.selectedRetro.id + '/sadCount').set(snapshot.numChildren());
      });
    }
    let activetRef = firebase.database().ref('retros/' + this.state.selectedRetro.id + '/active');
    activetRef.set(!this.state.selectedRetro.active);
  }

  filterDeadRetros = event => {
    this.setState({filteredDeadRetros: this.state.deadRetros.filter(item => item.name.toUpperCase().includes(event.target.value.toUpperCase()))
    });
  }

  filterActiveRetros = event => {
    this.setState({filteredActiveRetros: this.state.activeRetros.filter(item => item.name.toUpperCase().includes(event.target.value.toUpperCase()))
    });
  }

  render() {
    return (
      <div>
      { this.state.selectedRetro? this.getRetroPage() : this.getRetroList()}
      </div>
    );
  }

  getRetroList(){
    return(
    <div>
      <CustomHeader user= {this.props.user} handleChangeTheme={this.props.handleChangeTheme} isDarkTheme={this.props.isDarkTheme}/>
      {this.state.loading ? <LinearProgress />:
      <div>
      <Grid container spacinig={24}>
        <Grid item xs={12} md={4}>
        <ExpansionPanel className="list-card" defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title"><span role='img' aria-label='active'>🏃</span> Active Retros</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="home-list-details">
          <Input className='retro-search' placeholder="Search" inputProps={{'aria-label': 'Description',}} startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>} onChange={this.filterActiveRetros}/>
              <List>
                {this.state.filteredActiveRetros.map((retro) =>{
                  return <ListItem key={retro.id} onClick={() => {this.selectRetro(retro)}}><ListItemText primary={retro.name} secondary={new Date(retro.startTime).toDateString()} /></ListItem>;
                })}
                <ListItem>
                  <Input value={this.state.input} className='input-item' placeholder="Add New Session" onChange={this.updateInputValue} />
                  <Button color="primary" variant="raised" size="small" disabled={this.state.input === ''} onClick={() => {this.createRetro()}}>+</Button> 
                </ListItem> 
              </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
        <Grid item xs={12} md={4}>
          <ExpansionPanel className="list-card" defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title"><span role='img' aria-label='dead'>👻</span> Dead Retros</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="home-list-details">
          <Input className='retro-search' placeholder="Search" inputProps={{'aria-label': 'Description',}} startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>} onChange={this.filterDeadRetros}/>
              <List>
              {this.state.filteredDeadRetros.map((retro) =>{
                  return <ListItem key={retro.id} className='chip-display' onClick={() => {this.selectRetro(retro)}}>
                  <ListItemText className='chip-padding' primary={retro.name} secondary={new Date(retro.startTime).toDateString()} />
                  <Chip className='chip-margin' label={"😀" + retro.happyCount}/>
                  <Chip className='chip-margin' label={"😐" + retro.mehCount}/>
                  <Chip className='chip-margin' label={"☹️" + retro.sadCount}/>
                  </ListItem>
                })}
              </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
        <Grid item xs={12} md={4}>
        <ExpansionPanel className="list-card" defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title"><span role='img' aria-label='incomplete'>📖</span> Incomplete Action Items</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="home-list-details">
          <List>
              {this.state.actionItems.filter(actionItem => !actionItem.isDone).map((actionItem) =>{
                  return <ListItem key={actionItem.id}>
                  <ListItemText className='chip-padding' primary={actionItem.content} secondary={new Date(actionItem.time).toDateString()} />
                    <Checkbox checked={actionItem.isDone} onChange={() => this.handleCompletedItem(actionItem)}/>
                  </ListItem>
                })}
              </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel className="list-card" defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="title"><span role='img' aria-label='complete'>📕</span> Complete Action Items</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="home-list-details">
          <List>
              {this.state.actionItems.filter(actionItem => actionItem.isDone).map((actionItem) =>{
                  return <ListItem key={actionItem.id}>
                  <ListItemText className='chip-padding' primary={actionItem.content} secondary={new Date(actionItem.time).toDateString()} />
                  <Checkbox checked={actionItem.isDone} onChange={() => this.handleCompletedItem(actionItem)}/>
                  </ListItem>
                })}
              </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
      </Grid>
      </div>
      }
    </div>
    );
  }

  getRetroPage(){
    return(
    <div>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <IconButton color="inherit" aria-label="Back">
            <BackIcon onClick={() => {this.deselectRetro()}}/>
          </IconButton>
          <Typography variant="subheading" className='retro-list-header' color="inherit" >
            {this.state.selectedRetro.name}
          </Typography>
          <Button aria-label="close" color="primary" variant="raised" onClick={() => {this.toggleSession()}}>{this.state.selectedRetro.active ? 'Close' : 'Reopen'}</Button>
        </Toolbar>
      </AppBar>
      <FloatingActionButtonZoom selectedRetro={this.state.selectedRetro} user={this.props.user}/>
    </div>
    );
  }
}

export default RetroList;




// WEBPACK FOOTER //
// ./src/components/RetroList.js