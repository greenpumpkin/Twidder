from gevent.wsgi import WSGIServer
from Twidder import app, database_helper

app.run(debug=True)
http_server = WSGIServer(('', 5000), app)
http_server.serve_forever()
#database_helper.init_db(app)