// JavaScript
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Endpoint that accepts a team name and returns associated players.
router.get('/', (req, res) => {
  const { team } = req.query;
  if (!team) {
    return res.status(400).json({ error: 'Missing team parameter' });
  }

  const dbPath = path.join(__dirname, '../../nba_rosters.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  db.all("SELECT * FROM players WHERE team = ?", [team], (err, rows) => {
    if (err) {
      console.error("Error fetching players:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // Assuming the players table has a "player" column.
      const players = rows.map(row => row.player);
      res.json(players);
    }
    db.close();
  });
});

module.exports = router;