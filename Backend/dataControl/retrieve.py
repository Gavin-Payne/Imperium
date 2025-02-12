import sqlite3
from datetime import datetime

def get_games_on_date(date):
    try:
        formatted_date = datetime.strptime(date, '%Y-%m-%d').strftime('%a, %b %d, %Y')
        
        conn = sqlite3.connect('nba_schedule.db')
        c = conn.cursor()
        c.execute("SELECT * FROM games WHERE date = ?", (formatted_date,))
        games = c.fetchall()
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        games = []
    finally:
        conn.close()
    return games

def get_all_players():
    try:
        conn = sqlite3.connect('nba_rosters.db')
        c = conn.cursor()
        c.execute("SELECT * FROM players")
        players = c.fetchall()
        return players
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return []
    finally:
        conn.close()

players = get_all_players()
for row in players:
    print(row)

# games = get_games_on_date('2024-10-22')
# for game in games:
#     print(game)
