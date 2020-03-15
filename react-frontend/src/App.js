import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

function fetchWith(name, mtd, params){
  if(mtd === 'POST' || mtd === 'DELETE') {
    return fetch(name, {method: mtd, 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)})
      .then(res => res.json());
    }
    return fetch(name, {method: mtd})
      .then(res => res.json());
}

class InputBox extends Component{
  constructor(props){
    super(props);
    this.state={fname : "", lname : "", time: "", kind: ""};
  }

  render(){
    return (<div><form onSubmit={event => 
      this.props.addAppt(this, event)}> <label> Patient name: {" "} 
      <input type="text" value={this.state.fname} name="First Name"
          onChange={event => this.setState({fname : event.target.value})} 
          placeholder="First Name"/> 
      <input type="text" value={this.state.lname} name="Last Name"
          onChange={event => this.setState({lname : event.target.value})} 
          placeholder="Last Name"/> 
      <input type="text" value={this.state.time} name="Time"
          onChange={event => this.setState({time : event.target.value})} 
          placeholder="Time"/>
      <input type="text" value={this.state.kind} name="Kind"
          onChange={event => this.setState({kind : event.target.value})} 
          placeholder="Kind"/> 
      <input type="submit" name="Kind" value="Enter"/> 
      </label>
      </form></div>)
  }
}

//the dashboard application
class App extends Component{
  constructor(props){
    super(props);
    this.state={doctorData : {},
                viewDoctor: "",
                viewDate: "",
                dateTxt: "",
                newApptID: 0};
    this.addAppt=this.addAppt.bind(this);
    this.removeAppt=this.removeAppt.bind(this);
  }

  componentDidMount(){
    this.setState({welcomeMessage : "loading..."});
    fetchWith('/get-data', 'GET', {})
    .then(data => this.setState({doctorData : data.doctors}));
  }

  addAppt(comp, event){
    event.preventDefault();
    var appt = comp.state;
    var apptID = this.state.newApptID;
    var dr = this.state.viewDoctor;
    var date = this.state.viewDate;
    var params = {apptID: apptID.toString(), ID: dr, date: date, appt: appt};
    this.setState(function(prev){
      if(!(date in prev.doctorData[dr].appts)){
        prev.doctorData[dr].appts[date] = {};
      }
      prev.doctorData[dr].appts[date][apptID] = appt;
      return {doctorData : prev.doctorData, newApptID : prev.newApptID + 1}});
    fetchWith('/add-appt', 'POST', params);
    comp.setState({fname : "", lname : "", time: "", kind: ""});
  }

  removeAppt(apptID){
    var dr = this.state.viewDoctor;
    var date = this.state.viewDate;
    var params = {apptID: apptID.toString(), ID: dr, date: date};
    this.setState(function(prev){
      delete prev.doctorData[dr].appts[date][apptID];
      return {doctorData : prev.doctorData}});
    fetchWith('/rmv-appt', 'DELETE', params);
  }


  render() {
    var doctorList = Object.entries(this.state.doctorData);
    var app = this;
    var DoctorDisplay = "";
    var doc = null, scheds;
    if(app.state.viewDoctor in app.state.doctorData){
      var doc = app.state.doctorData[app.state.viewDoctor];
      var schedDisplay = "";
      if(app.state.viewDate != ""){
        var schedTableDisplay = "";
        if(app.state.viewDate in doc.appts){
          scheds = Object.entries(doc.appts[app.state.viewDate]);
          schedTableDisplay = (<div>{scheds.map(item => 
            <p eventKey = {item[0]} > Name: {item[1].fname} {item[1].lname}   |     
            Time: {item[1].time}   | Kind: {item[1].kind}
            <a onClick={event => this.removeAppt(item[0])}> | (Remove)</a></p>)}</div>);
        }
        schedDisplay = (<div>{schedTableDisplay}
            <InputBox addAppt={app.addAppt} /></div>);
      }
      DoctorDisplay = (<div>
        <h2>Dr. {doc.fname} {doc.lname}</h2>
        <h3>{doc.email}</h3>
        <form onSubmit={function(event){
      event.preventDefault();
      app.setState(function(prev){return {viewDate : prev.dateTxt};});}}> 
      <label> Date: {" "} 
      <input type="text" value={app.state.value} name="date"
          onChange={event => app.setState({dateTxt: event.target.value})} placeholder="enter date"/> 
      </label>
      </form>
        {schedDisplay}</div>)
    }
    return (<div>
      <ul>{doctorList.map(function(item){
          var selected = ""
          if(item[0] == app.state.viewDoctor){
            selected = '(X)'
          }
          return (<li eventKey = {item[0]}> <a onClick={(event)=>
          app.setState({viewDoctor : item[0]})}>
              {item[1].lname}, {item[1].fname} </a> {selected} </li>)})}</ul>
      <div class="App">
        <h1>{window.token}</h1>
        {DoctorDisplay}
        </div></div>
  );
  }
}

export default App;
