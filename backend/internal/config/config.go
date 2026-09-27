package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DBDriver    string // "sqlite" or "postgres"
	SQLitePath  string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	DatabaseURL string
}

func LoadConfig() *Config {
	// Attempt to load .env file if it exists
	_ = godotenv.Load()

	databaseURL := os.Getenv("DATABASE_URL")
	explicitDriver := strings.ToLower(os.Getenv("DB_DRIVER"))

	driver := "sqlite"
	// Automatic Railway / Production detection:
	// If DATABASE_URL is set (Railway automatically injects DATABASE_URL for Postgres)
	// or if DB_DRIVER is explicitly set to postgres
	if strings.HasPrefix(databaseURL, "postgres://") ||
		strings.HasPrefix(databaseURL, "postgresql://") ||
		explicitDriver == "postgres" ||
		explicitDriver == "postgresql" {
		driver = "postgres"
	}

	cfg := &Config{
		Port:        getEnv("PORT", "8095"),
		DBDriver:    driver,
		SQLitePath:  getEnv("SQLITE_PATH", "./moneytrack.db"),
		DBHost:      getEnv("DB_HOST", "127.0.0.1"),
		DBPort:      getEnv("DB_PORT", "5439"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "moneytrack"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		DatabaseURL: databaseURL,
	}

	return cfg
}

func (c *Config) GetDSN() string {
	if c.DBDriver == "sqlite" {
		return c.SQLitePath
	}

	if c.DatabaseURL != "" {
		return c.DatabaseURL
	}
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode)
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
