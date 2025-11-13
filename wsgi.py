production-flask-wsgi
# WSGI entry point for production (Render uses gunicorn to load this)
# This ensures Socket.IO + Flask work correctly under Gunicorn

from backend.app import app, socketio

if __name__ == "__main__":
    # For local testing only
    socketio.run(app, host="0.0.0.0", port=8000, debug=False)
