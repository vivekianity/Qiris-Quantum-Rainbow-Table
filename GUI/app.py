from flask import Flask, render_template, request, jsonify, current_app
import re
from RainbowTableGen import generate_rainbow_table
from RainbowTableGrover import search
from werkzeug.utils import secure_filename
from Method2 import rainbow_table_generation, search_method2
import os

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for flashing messages

@app.route('/quantum_search')
def quantum_search():
    return render_template('quantum_search.html')

def is_valid_md5(hash_str):
    return re.match(r'^[a-f0-9]{32}$', hash_str) is not None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'txt'}

@app.route('/quantum_search_method_1', methods=['POST'])
def quantum_search_method_1():
    try:
        md5Hash = request.form['md5_hash']
        if not is_valid_md5(md5Hash):
            return jsonify({'status': 'error', 'message': 'The input is not a valid MD5 hash. Please enter a 32-character hexadecimal string.'})

        file = request.files.get('file')
        use_default = False

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join('/tmp', filename)
            file.save(file_path)
        else:
            file_path = os.path.join(current_app.static_folder, 'default.txt')
            use_default = True

        with open(file_path, 'r', encoding='latin-1') as f:
            plaintexts = f.read().splitlines()
            rainbow_table_method_1, buckets = generate_rainbow_table(plaintexts)
        password = search(rainbow_table_method_1, buckets, md5Hash)
        
        if not use_default:
            os.remove(file_path)  # Clean up the saved file if not using default
        
        if password is not None:
            return jsonify({'status': 'success', 'message': f'Password Found! The password is: {password}'})
        else:
            return jsonify({'status': 'error', 'message': 'Hash not found'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'An error occurred: {str(e)}'})

@app.route('/quantum_search_method_2', methods=['POST'])
def quantum_search_method_2():
    try:
        md5Hash = request.form['md5_hash']
        if not is_valid_md5(md5Hash):
            return jsonify({'status': 'error', 'message': 'The input is not a valid MD5 hash. Please enter a 32-character hexadecimal string.'})

        file = request.files.get('file')
        use_default = False

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join('/tmp', filename)
            file.save(file_path)
        else:
            file_path = os.path.join(current_app.static_folder, 'default.txt')
            use_default = True

        with open(file_path, 'r', encoding='latin-1') as f:
            plaintexts = f.read().splitlines()
            rainbow_table = rainbow_table_generation(plaintexts)

        password = search_method2(rainbow_table, md5Hash)
        
        if not use_default:
            os.remove(file_path)  # Clean up the saved file if not using default
        
        if password is not None:
            return jsonify({'status': 'success', 'message': f'Password Found! The password is: {password}'})
        else:
            return jsonify({'status': 'error', 'message': 'Hash not found'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'An error occurred: {str(e)}'})

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/rainbow_table')
def rainbow_table():
    return render_template('rainbow_table.html')

@app.route('/quantum')
def quantum():
    return render_template('quantum.html')

@app.route('/quantum_rainbowtable')
def quantum_rainbowtable():
    return render_template('quantum_rainbowtable.html')


if __name__ == '__main__':
     app.run(debug=True, host='0.0.0.0')
