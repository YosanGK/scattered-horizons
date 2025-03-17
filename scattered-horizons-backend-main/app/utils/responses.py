from flask import jsonify, make_response

def success_response(message, data=None, status_code=200):
    response = make_response(jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), status_code)
    
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

def error_response(message, status_code=400):
    response = make_response(jsonify({
        "status": "error",
        "message": message
    }), status_code)
    
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response
