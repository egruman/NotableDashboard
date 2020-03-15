import flask

app = flask.Flask("__main__")

serverState = {'doctors' : {'ID1' : {'fname' : 'A', 'lname' : 'a', 'email' : 'a@notablehealth.com', 'appts' : {}}, 
                            'ID2' : {'fname' : 'B', 'lname' : 'b', 'email' : 'b@notablehealth.com', 'appts' : {}}, 
                            'ID3' : {'fname' : 'C', 'lname' : 'c', 'email' : 'c@notablehealth.com', 'appts' : {}}}}

@app.route("/")
def index():
    print('started')
    return flask.render_template("index.html", token="Doctor Appointment Dashboard")

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/get-data', methods=['GET'])
def get_data():
    req = flask.request.get_json()
    return flask.jsonify(serverState)

@app.route('/add-appt', methods=['POST'])
def appt():
    print('hello')
    req = flask.request.get_json()
    ID = req['ID']
    date = req['date']
    appt = req['appt']
    apptID = req['apptID']
    if not (date in serverState['doctors'][ID]['appts']):
        serverState['doctors'][ID]['appts'][date] = {}
    serverState['doctors'][ID]['appts'][date][apptID] = appt
    return flask.jsonify({'status': 'added'})

@app.route('/rmv-appt', methods=['DELETE'])
def remove():
    req = flask.request.get_json()
    ID = req['ID']
    date = req['date']
    apptID = req['apptID']
    print(serverState['doctors'][ID]['appts'][date])
    print(apptID)
    del serverState['doctors'][ID]['appts'][date][apptID]
    return flask.jsonify({'status': 'removed'})
    

app.run(debug=True)
