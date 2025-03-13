# Test query script
import sqlite3
import os

# Print current directory for debugging
print(os.getcwd())

# Connect to the database (make sure path is correct)
conn = sqlite3.connect('nba_schedule.db')
c = conn.cursor()

# Look for March 4, 2025 games with exact format from CSV
c.execute("SELECT * FROM games WHERE date = ?", ("Tue, Mar 4, 2025",))
games = c.fetchall()
print(f"Games found with exact format: {len(games)}")
for game in games:
    print(game)

conn.close()