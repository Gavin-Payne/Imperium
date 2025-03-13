import sqlite3
from datetime import datetime

def get_games_on_date(date):
    try:
        # First convert to datetime object
        dt = datetime.strptime(date, '%Y-%m-%d')
        
        # Format without leading zero in day number
        # On Windows, use %#d to remove leading zero
        try:
            # Windows format
            formatted_date = dt.strftime('%a, %b %#d, %Y')
        except ValueError:
            # Unix/Linux format
            formatted_date = dt.strftime('%a, %b %-d, %Y')
        except:
            # Fallback: manual removal of leading zero
            formatted_date = dt.strftime('%a, %b %d, %Y')
            if formatted_date[8] == '0':
                formatted_date = formatted_date[:8] + formatted_date[9:]
        
        print(f"Looking for games with date: '{formatted_date}'")
        
        conn = sqlite3.connect('nba_schedule.db')
        c = conn.cursor()
        c.execute("SELECT * FROM games WHERE date = ?", (formatted_date,))
        games = c.fetchall()
        print(f"Found {len(games)} games")
        return games
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        games = []
    finally:
        if 'conn' in locals():
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
        if 'conn' in locals():
            conn.close()

players = get_all_players()
for row in players:
    print(row)

games = get_games_on_date('2025-3-4')
for game in games:
    print(game)
