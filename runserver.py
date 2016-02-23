from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from Twidder import app

app.run(debug=True)
server = pywsgi.WSGIServer(("", 5000), app, handler_class=WebSocketHandler)
server.serve_forever()
#database_helper.init_db(app)