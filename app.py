from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os 
from dotenv import load_dotenv

from flask_sqlalchemy import SQLAlchemy

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['MYSQL_URL']

CORS(app)
db = SQLAlchemy(app)

db_host = os.environ.get('DB_HOST') or '127.0.0.1'
db_port = os.environ.get('DB_PORT') or '3306'
db_user = os.environ.get('DB_USER') or 'root'
db_password = os.environ.get('DB_PASSWORD') or 'estibaliZ1.'
db_name = os.environ.get('DB_NAME') or 'fullstack_bottega'

db = mysql.connector.connect(
    host=db_host,
    port=db_port,
    user=db_user,
    password=db_password,
    database=db_name
)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email']
    
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users1 WHERE email_users=%s", (email,))
    result = cursor.fetchone()
    
    if result is not None:
        return jsonify({'message': 'El usuario ya está registrado'}), 400
    
    cursor.execute("INSERT INTO users1 (email_users) VALUES (%s)", (email,))
    db.commit()
    
    return jsonify({'message': 'Registro exitoso'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users1 WHERE email_users=%s", (email,))
    result = cursor.fetchone()
    if result is None:
        unsuccess_message = f'Usuario con el email: {email} no se ha encontrado'
        return jsonify({'message': unsuccess_message}), 404
    else: 
        idusers = result[0]
        success_message = f'Inicio de sesión exitoso para el usuario con id: {idusers} y el email:{email}'

        return jsonify({'message': success_message, 'idusers': idusers }), 200

@app.route('/logout', methods=['GET'])
def logout():
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@app.route('/check-authentication', methods=['GET'])
def check_authentication():
    is_authenticated = True  
    
    return jsonify({'isLoggedIn': is_authenticated}), 200

@app.route('/items', methods=['GET', 'POST'])
def handle_items():
    if request.method == 'GET':
        query = 'SELECT * FROM items1 ORDER BY id DESC'

        cursor = db.cursor()
        cursor.execute(query)

        items = []
        for item in cursor.fetchall():
            item_data = {
                'id': item[0],
                'name': item[1],
                'itemiduser': item[2],
                'fecha': item[3]
            }
            items.append(item_data)

        return jsonify(items)

    elif request.method == 'POST':
        data = request.get_json()
        item = data.get('name')
        itemiduser = data.get('itemiduser')  

        if item and itemiduser:
            try:
                query = 'INSERT INTO items1 (name, itemiduser) VALUES (%s, %s)'

                item_data = (item, itemiduser)

                cursor = db.cursor()
                cursor.execute(query, item_data)
                db.commit()

                return jsonify({'message': 'Item added successfully'})
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({'error': 'Invalid item'}), 400
        
@app.route('/users', methods=['GET'])
def handle_users():
    if request.method == 'GET':
        query = 'SELECT * FROM users1 ORDER BY idusers'

        cursor = db.cursor()
        cursor.execute(query)

        users = []
        for u in cursor.fetchall():
            u_data = {
                'idusers': u[0],
                'name': u[1]
            }
            users.append(u_data)

        return jsonify(users)

@app.route('/items/<int:index>', methods=['DELETE', 'PUT'])
def handle_item_by_index(index):
    if request.method == 'DELETE':
        query = 'DELETE FROM items1 WHERE id = %s'

        item_index = (index,)

        cursor = db.cursor()
        cursor.execute(query, item_index)
        db.commit()

        return jsonify({'message': 'Item deleted successfully'})

    elif request.method == 'PUT':
        new_name = request.json.get('name')
        if new_name:
            query = 'UPDATE items1 SET name = %s WHERE id = %s'

            item_data = (new_name, index)

            cursor = db.cursor()
            cursor.execute(query, item_data)
            db.commit()

            return jsonify({'message': 'Item edited successfully'})
        else:
            return jsonify({'error': 'Invalid item'})

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user_email(user_id):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT email_users FROM users1 WHERE idusers=%s", (user_id,))
        result = cursor.fetchone()

        if result is not None:
            email = result[0]
            return jsonify({'email_users': email}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
