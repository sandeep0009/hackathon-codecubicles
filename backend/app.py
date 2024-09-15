import os
import io
import base64
import pandas as pd
from flask import Flask, request, jsonify, send_file
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pymysql
import psycopg2
from transformers import pipeline
import spacy
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)

# Load Spacy model
nlp = spacy.load("en_core_web_sm")

# Initialize summarizer pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_data_from_database(db_type, host, port, user, password, database, table_name):
    connection_str = f"{db_type}+pymysql://{user}:{password}@{host}:{port}/{database}" if db_type == 'mysql' else f"{db_type}://{user}:{password}@{host}:{port}/{database}"
    engine = create_engine(connection_str)
    Session = sessionmaker(bind=engine)
    session = Session()
    result = session.execute(text(f"SELECT * FROM {table_name}")).fetchall()
    columns = [column[0] for column in session.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]
    data = pd.DataFrame(result, columns=columns)
    session.close()
    return data

def load_data_from_file(file_path, file_type):
    if file_type == 'csv':
        return pd.read_csv(file_path)
    elif file_type in ['xls', 'xlsx']:
        return pd.read_excel(file_path)

def generate_insights(dataframe):
    text_data = dataframe.to_string()
    max_input_length = 1024
    if len(text_data) > max_input_length:
        text_data = text_data[:max_input_length]
    
    summary = summarizer(text_data, max_length=130, min_length=30, do_sample=False)
    doc = nlp(text_data)
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    # Generate plot
    fig, ax = plt.subplots(figsize=(10, 8))
    dataframe.hist(ax=ax)
    plt.title('Distribution of Features in the Dataset')
    plt.xlabel('Feature Values')
    plt.ylabel('Frequency')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    img_base64 = base64.b64encode(img.getvalue()).decode('utf8')

    return {
        "summary": summary[0]['summary_text'],
        "entities": entities,
        "plot": img_base64
    }

@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    
    # Check if the file has a valid extension
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        file_type = filename.rsplit('.', 1)[1].lower()
        data = load_data_from_file(file_path, file_type)
        
        # Generate insights from data
        insights = generate_insights(data)
        return jsonify({
            "summary": insights['summary'],
            "entities": insights['entities'],
            "plot": insights['plot']
        })
    else:
        return jsonify({"error": "Invalid file type. Allowed types are csv, xls, xlsx."}), 400

@app.route('/database', methods=['POST'])
def database_connect():
    db_type = request.json.get('db_type')
    host = request.json.get('host')
    port = request.json.get('port')
    user = request.json.get('user')
    password = request.json.get('password')
    database = request.json.get('database')
    table_name = request.json.get('table_name')

    try:
        data = load_data_from_database(db_type, host, port, user, password, database, table_name)
        insights = generate_insights(data)
        return jsonify({
            "summary": insights['summary'],
            "entities": insights['entities'],
            "plot": insights['plot']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/test', methods=['GET'])
def test():
    return "API is working!"

if __name__ == '__main__':
    app.run(debug=True)
