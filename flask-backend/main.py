import flask
import datetime

app = flask.Flask("__main__")

doctorList = [{'fname' : 'Julius', 'lname' : 'Hibbert', 'email' : 'jhibbert@notablehealth.com'},
            {'fname' : 'Algernop', 'lname' : 'Krieger', 'email' : 'arieger@notablehealth.com'},
            {'fname' : 'Nick', 'lname' : 'Riviera', 'email' : 'nriviera@notablehealth.com'}]

serverState = {'doctors' : {}}

def doctorDataInit(inputs):
    for d in inputs:
        uniqueID = d['fname']+d['lname']+str(datetime.datetime.now())
        serverState['doctors'][uniqueID] = dict(d)
        serverState['doctors'][uniqueID]['appts'] = {}

doctorDataInit(doctorList)

print('server started')

@app.route("/")
def index():
    print('connected')
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
