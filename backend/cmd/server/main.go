package main

import (
	"fmt"
	"log"

	"moneytrack/internal/config"
	"moneytrack/internal/database"
	"moneytrack/internal/handlers"
	"moneytrack/internal/repository"
	"moneytrack/internal/routes"
)

func main() {
	log.Println("Starting Money Track API Server...")

	// 1. Load Configuration
	cfg := config.LoadConfig()
	log.Printf("Active Database Driver: %s\n", cfg.DBDriver)

	// 2. Initialize Database & Run Migrations
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}
	defer db.Close()

	// 3. Initialize Repositories (Driver-aware for SQLite & PostgreSQL)
	typeRepo := repository.NewTypeRepository(db, cfg.DBDriver)
	cardRepo := repository.NewCardRepository(db, cfg.DBDriver)
	expenseRepo := repository.NewExpenseRepository(db, cfg.DBDriver)
	incomeRepo := repository.NewIncomeRepository(db, cfg.DBDriver)
	statsRepo := repository.NewStatsRepository(db, cfg.DBDriver)

	// 4. Initialize Handlers
	typeHandler := handlers.NewTypeHandler(typeRepo)
	cardHandler := handlers.NewCardHandler(cardRepo, expenseRepo, incomeRepo, typeRepo)
	expenseHandler := handlers.NewExpenseHandler(expenseRepo, typeRepo)
	incomeHandler := handlers.NewIncomeHandler(incomeRepo, typeRepo)
	statsHandler := handlers.NewStatsHandler(statsRepo, expenseRepo, incomeRepo)

	// 5. Setup Router
	router := routes.SetupRouter(expenseHandler, incomeHandler, typeHandler, statsHandler, cardHandler)

	// 6. Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Money Track Backend is running on http://localhost%s\n", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Server stopped with error: %v", err)
	}
}
