// JavaScript
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// This route gets players for a specific team - no need for verifyToken during debugging
router.get('/:team', async (req, res) => {
  const team = req.params.team;
  console.log(`Fetching players for team: ${team}`);
  
  try {
    // Use an absolute path to the database file
    const dbPath = path.join(__dirname, '../../nba_rosters.db');
    console.log(`Database path: ${dbPath}`);
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    
    db.all("SELECT * FROM players WHERE team = ?", [team], (err, rows) => {
      if (err) {
        console.error("Error fetching players:", err.message);
        db.close();
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`Raw query results for ${team}:`, rows);
      
      // Extract player names from correct column
      // Based on your database structure: (id, team_name, player_name)
      let players = [];
      if (rows && rows.length > 0) {
        players = rows.map(row => {
          // Check if SQLite returns an array or object
          if (Array.isArray(row)) {
            return row[2]; // Third element is player_name in array format
          } else if (typeof row === 'object') {
            // SQLite can return either column name or index-based object
            return row.player || row.player_name || row[2];
          } else {
            return String(row);
          }
        });
      }
      
      console.log(`Processed players for ${team}:`, players);
      
      db.close();
      res.json(players.filter(p => p !== null && p !== undefined));
    });
  } catch (error) {
    console.error(`Failed to process request for team ${team}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;