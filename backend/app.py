import os
from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Database connection config (use your actual credentials or environment variables)
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'postgres')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')

conn_params = {
    'host': DB_HOST,
    'port': DB_PORT,
    'dbname': DB_NAME,
    'user': DB_USER,
    'password': DB_PASSWORD
}

def get_db_conn():
    return psycopg2.connect(**conn_params, cursor_factory=psycopg2.extras.RealDictCursor)

@app.route('/api/analytics/monthly-energy')
def monthly_energy():
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT to_char(date_trunc('month', delivered_at), 'Mon') AS month, SUM(energy_used) AS saved
                FROM deliveries
                GROUP BY 1
                ORDER BY min(date_trunc('month', delivered_at))
            ''')
            rows = cur.fetchall()
    return jsonify(rows)

@app.route('/api/analytics/department-efficiency')
def department_efficiency():
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT d.name AS department_name, AVG(del.energy_used) AS avg_energy_used
                FROM departments d
                LEFT JOIN deliveries del ON del.department_id = d.id
                GROUP BY d.name
            ''')
            rows = cur.fetchall()
    return jsonify(rows)

@app.route('/api/analytics/today')
def today_stats():
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT COALESCE(SUM(energy_used),0) AS energy_saved, COUNT(*) AS deliveries
                FROM deliveries
                WHERE delivered_at::date = CURRENT_DATE
            ''')
            row = cur.fetchone()
    return jsonify(row)

@app.route('/api/analytics/live')
def live_deliveries():
    # For polling: return deliveries from the last 5 minutes
    since = datetime.utcnow() - timedelta(minutes=5)
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                SELECT * FROM deliveries WHERE delivered_at >= %s ORDER BY delivered_at DESC
            ''', (since,))
            rows = cur.fetchall()
    return jsonify(rows)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
