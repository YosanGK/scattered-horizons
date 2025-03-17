from app import create_app
from flask import request

app = create_app()

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
