import requests
from bs4 import BeautifulSoup
import sqlite3
import time
import re

# Change this base if needed
BASE_TEAMS_URL = "https://pdfroster.nba.com/nba/"

def create_database(db_path='nba_rosters.db'):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team TEXT NOT NULL,
            player TEXT NOT NULL
        )
    ''')
    conn.commit()
    return conn

def insert_player(conn, team, player):
    c = conn.cursor()
    c.execute('INSERT INTO players (team, player) VALUES (?, ?)', (team, player))
    conn.commit()

def get_team_links():
    """
    Scrape the teams page to extract team names and their roster page URLs.
    """
    url = BASE_TEAMS_URL
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/112.0.0.0 Safari/537.36'
        ),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    team_links = []
    # Look for team links inside a div with classes "small-12 large-4 columns"
    for div in soup.select('div.small-12.large-4.columns'):
        a_tag = div.find('h3').find('a')
        if a_tag and a_tag.get('href'):
            team_url = a_tag['href']
            team_name = a_tag.get_text(strip=True)
            team_links.append((team_name, team_url))
    return team_links

def get_players_for_team(team_url):
    """
    Visit team roster page and extract player names.
    Player names are contained in divs with classes 
    "small-12 medium-3 large-3 columns player" and inside an <h3>.
    The jersey number follows a '#' which we remove.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    response = requests.get(team_url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    players = []
    # Select all divs containing player info
    for player_div in soup.select('div.small-12.medium-3.large-3.columns.player'):
        h3 = player_div.find('h3')
        if h3:
            # Get text and remove jersey number after '#'
            text = h3.get_text(strip=True)
            # Use regex to remove jersey number if present
            name = re.split(r'#', text)[0].strip()
            if name:
                players.append(name)
    return players

def main():
    conn = create_database()
    try:
        print("Fetching team links...")
        teams = get_team_links()
        if not teams:
            print("No team links found.")
            return

        for team_name, team_url in teams:
            print(f"Processing team: {team_name} ({team_url})")
            try:
                player_names = get_players_for_team(team_url)
                if player_names:
                    for player in player_names:
                        insert_player(conn, team_name, player)
                    print(f"Inserted {len(player_names)} players for {team_name}.")
                else:
                    print(f"No players found for {team_name}.")
            except Exception as e:
                print(f"Error processing {team_name}: {e}")
            # Pause to avoid overloading the server
            time.sleep(1)
    finally:
        conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    main()