import React, { Component } from 'react';
import { IconButton, MenuList,MenuItem, Paper, Dialog, DialogActions,
    DialogContent,
    DialogTitle, TextField, LinearProgress, Checkbox, Input, Button, List,ListItem, ListItemSecondaryAction, ListItemText} from '@material-ui/core'
import * as firebase from 'firebase';
import DeleteIcon from 'material-ui-icons/Delete';


class SessionList extends Component {

    constructor(props){
        super(props);
        this.retroListDatabaseRef = firebase.database().ref('retroSessions/' + this.props.selectedRetro.id + '/' + this.props.type);
        this.state = {
          input: '',
          list: [],
          loading: true,
          openDialog: false,
          autoCompleteList: [],
          assignedTo: null,
          popupInput: '',
          PopupAssignedToText: '',
        };

        this.getList = this.getList.bind(this);
        this.updateInputValue = this.updateInputValue.bind(this);
        this.createItem = this.createItem.bind(this);
        this.checkItem = this.checkItem.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.assignToUser = this.assignToUser.bind(this);
        this.updatePopupInputValue = this.updatePopupInputValue.bind(this);
        this.createActionItem = this.createActionItem.bind(this);
        this.openActionPopup = this.openActionPopup.bind(this);
        
      }

    componentWillMount(){
        this.getList();
    }

    getList(){
        if(this.props.type === 'action'){
            firebase.database().ref('actionItems/').orderByChild('retroId').equalTo(this.props.selectedRetro.id).on('value', (snapshot) => {
                let array = []
                snapshot.forEach((childSnapshot) => {
                  array.push(childSnapshot.val());
                });
                this.setState({
                    list: array,
                    loading: false,
                });
              }); 
        } else{
        this.retroListDatabaseRef.on('value', (snapshot) => {
            let array = []
            snapshot.forEach((childSnapshot) => {
              array.push(childSnapshot.val());
            });
            this.setState({
                list: array,
                loading: false,
            });
          });
        }
    }

    updateInputValue(evt){
        this.setState({
          input: evt.target.value
        });
    }

    updatePopupInputValue(evt){
        this.setState({
          popupInput: evt.target.value
        });
    }

    createItem(){
        let date = new Date();
        let newListRef = this.retroListDatabaseRef.push();
        newListRef.set({
          content: this.state.input,
          id: newListRef.key,
          likeCount: 0,
          time: date.getTime(),
          user: this.props.user.displayName,
          email: this.props.user.email,
          isDone: false,
        });
        this.setState({
          input: '',
        });
    }

    upVoteItem(id){
    let countRef = firebase.database().ref('retroSessions/' + this.props.selectedRetro.id + '/' + this.props.type + '/' + id + '/likeCount');
    countRef.transaction((count) => {
        return count + 1;
        });
    }

    checkItem(id){
        let checkRef = firebase.database().ref('retroSessions/' + this.props.selectedRetro.id + '/' + this.props.type + '/' + id + '/isDone');
        checkRef.transaction((value) => {
            if (!value){
               this.openActionPopup();
            }
            return !value;
        });
    }

    deleteItem(id){
        if(this.props.type === 'action'){
            firebase.database().ref('actionItems/' + id).remove();
        } else {
            firebase.database().ref('retroSessions/' + this.props.selectedRetro.id + '/' + this.props.type + '/' + id).remove();
        }
    }

    handleClose() {
        this.setState({ 
            openDialog: false, 
            popupInput: '', 
            autoCompleteList: [],
            assignedTo: null,
            PopupAssignedToText: ''
        });
    }

    createActionItem() {
        if(this.state.assignedTo){
            let date = new Date();
            let newListRef = firebase.database().ref('actionItems/').push();
            newListRef.set({
                content: this.state.popupInput,
                id: newListRef.key,
                time: date.getTime(),
                user: this.state.assignedTo.name,
                email: this.state.assignedTo.email,
                isDone: false,
                retroId: this.props.selectedRetro.id,
                userId: this.state.assignedTo.id,
            });
            this.handleClose();
        }
    }

    getUsersAutocomplete = event => {
        this.setState({
            autoCompleteList: [],
            PopupAssignedToText: event.target.values,
          });
        if(event.target.value !== ''){
            let queryString = event.target.value;
            firebase.database().ref('users').orderByChild('email')
            .startAt(queryString)
            .endAt(`${queryString}\uf8ff`)
            .limitToFirst(5).on('child_added', (child) => {
                this.setState(prevState => ({
                    autoCompleteList: [...prevState.autoCompleteList, child.val()]
                }))
            });
        }
    }

    assignToUser(item){
        this.setState({
            assignedTo: item,
            PopupAssignedToText: item.email,
            autoCompleteList: [],
        });
    }

    openActionPopup(){
        this.setState({ openDialog: true });
    }

    render() {
        return (
        <div>
        {this.state.loading ? <LinearProgress /> :
            <div className="session-list-page"> 
            <Dialog
            open={this.state.openDialog}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            >
            <DialogTitle id="form-dialog-title">Assign Action Item</DialogTitle>
            <DialogContent>
                <TextField
                    className='test'
                    label="Action Item"
                    type="text"
                    multiline
                    value={this.state.popupInput}
                    onChange={this.updatePopupInputValue}
                    fullWidth />
                <TextField
                    label="Assign To"
                    type="text"
                    fullWidth
                    value={this.state.PopupAssignedToText}
                    onChange={this.getUsersAutocomplete} />
                {this.state.autoCompleteList.length !== 0 ?
                 <Paper className='assign-dropdown'>
                    <MenuList>
                        {this.state.autoCompleteList.map(item => (
                        <MenuItem key={item.id} onClick={() => this.assignToUser(item)}>
                            {item.email}
                        </MenuItem>
                        ))}
                    </MenuList>
                </Paper> : ''}
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleClose} color="primary">Skip</Button>
                <Button onClick={this.createActionItem} color="primary">Assign</Button>
            </DialogActions>
            </Dialog>
                <List dense className="session-list">
                { this.state.list.map((item) =>{
                return (<ListItem key={item.id}>
                    {this.props.selectedRetro.active ?
                    <IconButton aria-label="Delete" disabled={item.email !== this.props.user.email} onClick={() => {this.deleteItem(item.id)}}>
                        <DeleteIcon color={item.email !== this.props.user.email? 'inherit':'error'}/>
                    </IconButton> : ''
                    }
                    <ListItemText className={(this.props.type !== 'action')? "session-list-text" : ''} primary={item.content} secondary={(this.props.type === 'action')? "Assigned To: " + item.user : item.user}/>
                    <ListItemSecondaryAction>
                        <Checkbox checked={item.isDone} disabled={!this.props.selectedRetro.active || this.props.type === 'action'} color="primary"  onClick={() => {this.checkItem(item.id)}}/>
                        {(this.props.type !== 'action')? <Button aria-label="plus" variant="raised" size="small" disabled={!this.props.selectedRetro.active} color="primary"  onClick={() => {this.upVoteItem(item.id)}}>
                        <span role='img' aria-label='Upvote'>👍</span>
                         {item.likeCount}</Button> : ''}
                    </ListItemSecondaryAction>
                </ListItem> );
                })}
                </List>
                {this.props.selectedRetro.active? ( (this.props.type !== 'action')? <div><Input value={this.state.input} onChange={this.updateInputValue} className='input-item' placeholder="Add Item" />
                <Button color="primary" variant="raised" size="small" disabled={this.state.input === ''} onClick={() => {this.createItem()}} >ADD</Button></div> :  <Button onClick={() => this.openActionPopup()} color="primary">Create Action Item</Button>) : ''}
            </div>
        }
        </div>
        );
  }
}

export default SessionList;




// WEBPACK FOOTER //
// ./src/components/SessionList.js