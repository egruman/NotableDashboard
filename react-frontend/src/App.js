import React, { Component } from 'react';
import logo from './logo.svg';
import DatePicker from "react-datepicker";
import TimePicker from 'react-time-picker';
import './App.css';
function getDt(date){
  return date.getFullYear().toString() + '/' +date.getMonth().toString() + '/' +date.getDate().toString();
}

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
    this.state={fname : "", lname : "", time: "10:00", kind: "New Patient"};
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
      <TimePicker clearIcon={null}
          value={this.state.time}
          onClockClose={()=>this.setState(function(prev){
            var hr_mn = prev.time.split(':');
            var min = 0;
            if(!isNaN(hr_mn[1])){
              min = parseInt(hr_mn[1]);
            }
            if(isNaN(hr_mn[0])){
              hr_mn[0] = '0';
            }
            min = Math.floor(min/15) * 15;
            var zero = "";
            if(min < 10){
              zero ='0';
            }
            return {time: hr_mn[0]+':'+zero+min.toString()};
          })}
          onChange={newTime => this.setState({time : newTime})} />
      <select value={this.state.kind} onChange={event => this.setState({kind : event.target.value})}>
            <option value="New Patient">New Patient</option>
            <option value="Follow-up">Follow-up</option>
          </select>
      <input type="submit" value="Enter"/> 
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
                viewDate: new Date()};
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
    var apptID = Date.now();
    var dr = this.state.viewDoctor;
    var date = getDt(this.state.viewDate);
    if(appt.lname === "" || appt.fname === ""){
      alert('Name incomplete.');
      return;
    }
    var params = {apptID: apptID, ID: dr, date: date, appt: appt};
    var total = 0;
    if(date in this.state.doctorData[dr].appts){   
      var apptsList = Object.values(this.state.doctorData[dr].appts[date]);
      for(var i in apptsList){
        var other = apptsList[i];
        console.log(JSON.stringify(other) +'==' + appt.time.toString());
        if(other.time === appt.time){
          total++;
        }
        if(total==3){
          alert('Too many appointments scheduled at that time.');
          return;
        }
      }
    }
    this.setState(function(prev){
      if(!(date in prev.doctorData[dr].appts)){
        prev.doctorData[dr].appts[date] = {};
      }
      prev.doctorData[dr].appts[date][apptID] = appt;
      return {doctorData : prev.doctorData}});
    fetchWith('/add-appt', 'POST', params);
    comp.setState({fname : "", lname : "", kind: ""});
  }

  removeAppt(apptID){
    var dr = this.state.viewDoctor;
    var date = getDt(this.state.viewDate);
    var params = {apptID: apptID, ID: dr, date: date};
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
      if(getDt(app.state.viewDate) != ""){
        var schedTableDisplay = "";
        if(getDt(app.state.viewDate) in doc.appts){
          scheds = Object.entries(doc.appts[getDt(app.state.viewDate)]);
          schedTableDisplay = (<div>{scheds.map((item, index) => 
            <p eventKey = {item[0]} > {index+1}. Name: {item[1].fname} {item[1].lname}   |     
            Time: {item[1].time}   | Kind: {item[1].kind}
            <a onClick={event => this.removeAppt(item[0])}> | (Remove)</a></p>)}</div>);
        }
        schedDisplay = (<div>{schedTableDisplay}
            <InputBox addAppt={app.addAppt} /></div>);
      }
      DoctorDisplay = (<div>
        <h2>Dr. {doc.fname} {doc.lname}</h2>
        <h3>{doc.email}</h3>
      <label> Select Date: {" "} 
      <DatePicker
        selected={this.state.viewDate}
          onChange={date => app.setState({viewDate: date})}/> 
      </label>
        {schedDisplay}</div>)
    }
    return (<div>
      <h1> Physician List: </h1>
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
        <br/><br/><br/><br/><br/><br/>
        </div></div>
  );
  }
}

export default App;
