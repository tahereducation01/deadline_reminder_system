from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.config.from_object('config.Config')

DATABASE = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

# ---------------- REGISTER ----------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('register'))

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, password)
            )
            conn.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Username or email already exists!', 'error')
        finally:
            conn.close()

    return render_template('register.html')

# ---------------- LOGIN ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        user = conn.execute(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            (email, password)
        ).fetchone()
        conn.close()

        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password!', 'error')

    return render_template('login.html')

# ---------------- DASHBOARD ----------------
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    rows = conn.execute("""
        SELECT *,
        CAST((julianday(deadline) - julianday('now')) * 86400 AS INTEGER)
        AS seconds_remaining
        FROM tasks
        WHERE user_id = ? AND status = 'pending'
        ORDER BY deadline
    """, (session['user_id'],)).fetchall()

    tasks = []

    for row in rows:
        task = dict(row)
        seconds = task.get('seconds_remaining', 0)

        if seconds > 0:
            days = seconds // (24 * 3600)
            seconds %= (24 * 3600)
            hours = seconds // 3600
            seconds %= 3600
            minutes = seconds // 60
            seconds %= 60
            task['countdown'] = {
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            }
        else:
            task['countdown'] = {
                'days': 0,
                'hours': 0,
                'minutes': 0,
                'seconds': 0
            }
            task['overdue'] = True

        tasks.append(task)

    weekly_tasks = conn.execute("""
        SELECT COUNT(*) FROM tasks
        WHERE user_id = ? AND status = 'pending'
        AND deadline BETWEEN datetime('now') AND datetime('now', '+7 days')
    """, (session['user_id'],)).fetchone()[0]

    conn.close()

    return render_template(
        'dashboard.html',
        tasks=tasks,
        weekly_tasks=weekly_tasks
    )

@app.route('/view_tasks')
def view_tasks():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    pending_tasks = conn.execute("""
        SELECT * FROM tasks
        WHERE user_id = ? AND status = 'pending'
        ORDER BY deadline
    """, (session['user_id'],)).fetchall()

    completed_tasks = conn.execute("""
        SELECT * FROM tasks
        WHERE user_id = ? AND status = 'completed'
        ORDER BY deadline DESC
    """, (session['user_id'],)).fetchall()

    conn.close()

    return render_template(
        'view_task.html',
        pending_tasks=pending_tasks,
        completed_tasks=completed_tasks
    )

# ---------------- ADD TASK ----------------
@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO tasks (user_id, title, description, deadline, reminder_type, reminder_interval)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session['user_id'],
            request.form['title'],
            request.form['description'],
            request.form['deadline'],
            request.form['reminder_type'],
            request.form['reminder_interval']
        ))
        conn.commit()
        conn.close()

        flash('Task added successfully!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('add_task.html')

# ---------------- COMPLETE TASK ----------------
@app.route('/complete_task/<int:task_id>')
def complete_task(task_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    conn = get_db_connection()
    conn.execute(
        "UPDATE tasks SET status='completed' WHERE id=? AND user_id=?",
        (task_id, session['user_id'])
    )
    conn.commit()
    conn.close()

    flash('Task marked as completed!', 'success')
    return redirect(url_for('dashboard'))

# ---------------- LOGOUT ----------------
@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
