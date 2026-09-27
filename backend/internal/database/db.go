package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
	"moneytrack/internal/config"
)

func InitDB(cfg *config.Config) (*sql.DB, error) {
	var driverName string
	var dsn string

	if cfg.DBDriver == "sqlite" {
		driverName = "sqlite"
		dsn = cfg.GetDSN()
		log.Printf("Connecting to local SQLite database at: %s\n", dsn)
	} else {
		driverName = "postgres"
		dsn = cfg.GetDSN()
		log.Println("Connecting to PostgreSQL database (Railway/Production)...")
	}

	db, err := sql.Open(driverName, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database (%s): %w", driverName, err)
	}

	if cfg.DBDriver == "sqlite" {
		// Optimize SQLite for concurrent web requests
		db.SetMaxOpenConns(1) // SQLite performs best with single writer or small pool
		if _, err := db.Exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;`); err != nil {
			log.Printf("Warning: failed setting sqlite pragmas: %v\n", err)
		}
	} else {
		// PostgreSQL connection pool
		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(5 * time.Minute)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to database (%s): %w", driverName, err)
	}

	log.Printf("Connected to %s successfully.\n", driverName)

	// Run migrations
	if err := RunMigrations(db, cfg.DBDriver); err != nil {
		return nil, fmt.Errorf("migration failure: %w", err)
	}

	return db, nil
}
