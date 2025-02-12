import sqlite3

dataBase = sqlite3.connect('nba_schedule.db')
base = dataBase.cursor()

# "DELETE FROM " 
base.execute("DROP TABLE IF EXISTS teams")
dataBase.commit()

base.execute("DROP TABLE IF EXISTS games")
dataBase.commit()
dataBase.close()

