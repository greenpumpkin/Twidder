from Twidder import app
from flask import request, render_template
import database_helper
import random
import json

@app.before_request
def before_request():
    database_helper.connect_db()


@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()


@app.route('/')
def start():
    return render_template('client.html')


@app.route('/signup', methods=['POST'])
def sign_up():
    # if request.method == 'POST':
    email = request.form['emailSign']
    password = request.form['passwordSign']
    firstname = request.form['firstName']
    familyname = request.form['familyName']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']

    if (database_helper.check_email(email) == True) and len(password) >= 6 \
            and (database_helper.check_gender(gender))\
            and len(firstname) > 0 and len(familyname) > 0\
            and len(city) > 0 and len(country) >0:
        signUp = database_helper.insert_user(email, password, firstname, familyname, gender, city, country)
        if signUp:
            return json.dumps({"success": True, "message": "Successfully created a new user."})
        else:
            return json.dumps({"success": False, "message": "Form data missing or incorrect type."})
    else:
        return json.dumps({"success": False, "message": "Form data missing or incorrect type."})

# Authenticates the username by the provided password
@app.route('/signin', methods=['POST'])
def sign_in():
    email = request.form['emailLog']
    password = request.form['passwordLog']
    signin = database_helper.sign_in_db(email, password)

    if signin:
        token = create_token()
        database_helper.add_logged_in(token, email)
        return json.dumps({'success': True, 'message': "Login successful!", 'token': token})
    else:
        return json.dumps({'success': False, 'message': "Wrong email or password"})


# Creates a random token
def create_token():
    ab = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    token = ''
    for i in range(0, 36):
        token += ab[random.randint(0, len(ab) - 1)]
    return token


# Signs out a user from the system
@app.route('/signout', methods=['POST'])
def sign_out():
    token = request.form['token']
    if database_helper.get_logged_in(token):
        database_helper.remove_logged_in(token)
        return json.dumps({"success": True, "message": "Successfully signed out."})
    else:
        return json.dumps({"success": False, "message": "You are not signed in"})


# Changes the password from the current user to a new one
@app.route('/changepassword', methods=['POST'])
def change_password():
    token = request.form['token']
    pwd = request.form['pwd']
    chgpwd = request.form['chgPwd']
    if not database_helper.get_logged_in(token):
        return json.dumps({'success': False, 'message': "You are not logged in."})
    else:
        if len(chgpwd) < 6:
            return json.dumps({"success": False, "message": "Error: password must be at least 6 characters long"})
        email = database_helper.get_email(token)
        validlog = database_helper.check_pwd(email, pwd)
        if not validlog:
            return json.dumps({'success': False, 'message': "Wrong password."})
        database_helper.modify_pwd(email[0], pwd, chgpwd)
        return json.dumps({'success': True, 'message': "Password changed."})


# Retrieves the stored data for the user whom the passed token is issued for.
# The currently signed-in user case use this method to retrieve all its own info from the server
@app.route('/getuserdatabytoken/<token>', methods=['GET'])
def get_user_data_by_token(token):
    if database_helper.get_logged_in(token):
        data = database_helper.get_user_data_by_token(token)
        if data is not None:
            return json.dumps({"success": True, "message": "User data retrieved.", "data": data})
        return json.dumps({"success": False, "message": "No such user."})
    return json.dumps({"success": False, "message": "You are not signed in."})


# Retrieves the stored data for the user specified by the email address
@app.route('/getuserdatabyemail/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token, email):
    if database_helper.get_logged_in(token):
        data = database_helper.get_user_data_by_email(email)
        if data is not None:
            return json.dumps({"success": True, "message": "User data retrieved.", "data": data})
        else:
            return json.dumps({"success": False, "message": "No such user."})
    else:
        return json.dumps({"success": False, "message": "You are not signed in."})


# Tries to post a message to the wall of the user specified by the email address
@app.route('/postmessage', methods=['POST'])
def post_message():
    message = request.form['message']
    token = request.form['token']
    email = request.form['email']
    sender = database_helper.get_email(token)[0]
    if database_helper.get_logged_in(token):
        if database_helper.in_users(email):
            database_helper.post_message(message, token, sender, email)
            return json.dumps({"success": True, "message": "Message posted."})
        else:
            return json.dumps({"success": False, "message": "No such user."})
    else:
        return json.dumps({"success": False, "message": "You are not signed in."})

# Retrieves the stored messages for the user whom the passed token is issued for.
# The currently signed-in user case use this method to retrieve all its own messages from the server.
@app.route('/getusermessagesbytoken/<token>', methods=['GET'])
def get_user_messages_by_token(token):
    if database_helper.get_logged_in(token):
        data = database_helper.get_user_messages_by_token_db(token)
        if data is not None:
            return json.dumps({"success": True, "message": "User messages retrieved.", "data": data })
        return json.dumps({"success": False, "message": "No such user."})
    return json.dumps({"success": False, "message": "You are not signed in."})

# Retrieves the stored messages for the user specified by the passed email address
@app.route('/getusermessagesbyemail/<token>/<email>', methods=['GET'])
def get_user_messages_by_email(token,email):
    if database_helper.get_logged_in(token):
        if (database_helper.in_users(email)):
            data = database_helper.get_user_messages_by_email_db(email)
            return json.dumps({"success": True, "message": "User messages retrieved.", "data": data })
        return json.dumps({"success": False, "message": "No such user."})
    else:
        return json.dumps({"success": False, "message": "You are not signed in."})

