import sqlite3
import csv
import os
print(os.getcwd())
# Connect to the database
conn = sqlite3.connect('nba_schedule.db')
c = conn.cursor()

# Create tables
c.execute('''CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY, date TEXT, start_time TEXT, visitor_team TEXT, home_team TEXT, arena TEXT)''')

# Read the CSV file and insert data into the tables
with open(r'Backend\dataControl\nba_schedule.csv', 'r') as file:
    reader = csv.DictReader(file)
    teams = set()
    for row in reader:
        visitor_team = row['Visitor/Neutral']
        home_team = row['Home/Neutral']
        
        teams.add(visitor_team)
        teams.add(home_team)
        
        c.execute("INSERT INTO games (date, start_time, visitor_team, home_team, arena) VALUES (?, ?, ?, ?, ?)", 
                  (row['Game Date'], row['Start (ET)'], visitor_team, home_team, row['Arena']))

for team in teams:
    c.execute("INSERT INTO teams (name) VALUES (?)", (team,))

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Data inserted successfully!")
