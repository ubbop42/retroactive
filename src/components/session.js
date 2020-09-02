import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { withStyles } from 'material-ui/styles';
import {Typography}from '@material-ui/core';
import SessionList from './SessionList';
import {Grid, Tabs, Tab, AppBar} from '@material-ui/core';


function TabContainer(props) {
  const { children, dir } = props;

  return (
    <Typography component="div" dir={dir} >
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
    root: {
        minHeight: 200,
      },
  });

class FloatingActionButtonZoom extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      value: 0,
      width: window.innerWidth,
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    const isMobile = this.state.width <= 1047;
    return (
      <div>
      { isMobile? 
      <div className="">
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth>
            <Tab label="😀" />
            <Tab label="😐" />
            <Tab label="☹️" />
            <Tab label="👊" />
          </Tabs>
        </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={this.state.value}
            onChangeIndex={this.handleChangeIndex}>
            <TabContainer dir={theme.direction}><SessionList type='happy' user={this.props.user} selectedRetro={this.props.selectedRetro}/></TabContainer>
            <TabContainer dir={theme.direction}><SessionList type='meh' user={this.props.user} selectedRetro={this.props.selectedRetro}/></TabContainer>
            <TabContainer dir={theme.direction}><SessionList type='sad' user={this.props.user} selectedRetro={this.props.selectedRetro}/></TabContainer>
            <TabContainer dir={theme.direction}><SessionList type='action' user={this.props.user} selectedRetro={this.props.selectedRetro}/></TabContainer>
          </SwipeableViews> 
      </div>
      :
      <Grid container spacing={24}>
        <Grid item xs={3}>
          <h1><span role='img' aria-label='Happy'>😀</span></h1>
          <SessionList type='happy' user={this.props.user} selectedRetro={this.props.selectedRetro}/>
        </Grid>
        <Grid item xs={3}>
          <h1><span role='img' aria-label='Meh'>😐</span></h1>
          <SessionList type='meh' user={this.props.user} selectedRetro={this.props.selectedRetro}/>
        </Grid>
        <Grid item xs={3}>
          <h1><span role='img' aria-label='Sad'>☹️</span></h1>
          <SessionList type='sad' user={this.props.user} selectedRetro={this.props.selectedRetro}/> 
        </Grid>
        <Grid item xs={3}>
          <h1><span role='img' aria-label='Action'>👊</span></h1>
          <SessionList type='action' user={this.props.user} selectedRetro={this.props.selectedRetro}/>
        </Grid>
      </Grid>
      }
      </div>
    );
  }
}

export default FloatingActionButtonZoom;



// WEBPACK FOOTER //
// ./src/components/session.js