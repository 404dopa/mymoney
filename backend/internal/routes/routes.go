package routes

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"moneytrack/internal/handlers"
	"moneytrack/internal/models"
)

func SetupRouter(
	expenseHandler *handlers.ExpenseHandler,
	incomeHandler *handlers.IncomeHandler,
	typeHandler *handlers.TypeHandler,
	statsHandler *handlers.StatsHandler,
	cardHandler *handlers.CardHandler,
) *gin.Engine {
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API Group
	api := r.Group("/api")
	{
		// Health Check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, models.SuccessResponse(gin.H{
				"status": "healthy",
				"time":   time.Now().Format(time.RFC3339),
			}))
		})

		// Preset Expense Cards (البطاقات التعريفية للمصاريف)
		api.GET("/expense-cards", cardHandler.GetAllExpenseCards)
		api.POST("/expense-cards", cardHandler.CreateExpenseCard)
		api.PUT("/expense-cards/:id", cardHandler.UpdateExpenseCard)
		api.DELETE("/expense-cards/:id", cardHandler.DeleteExpenseCard)
		api.POST("/expense-cards/:id/record", cardHandler.RecordExpenseFromCard)

		// Preset Income Cards (البطاقات التعريفية للإيرادات)
		api.GET("/income-cards", cardHandler.GetAllIncomeCards)
		api.POST("/income-cards", cardHandler.CreateIncomeCard)
		api.PUT("/income-cards/:id", cardHandler.UpdateIncomeCard)
		api.DELETE("/income-cards/:id", cardHandler.DeleteIncomeCard)
		api.POST("/income-cards/:id/record", cardHandler.RecordIncomeFromCard)

		// Recorded Expenses (المصاريف المسجلة)
		api.GET("/expenses", expenseHandler.GetAll)
		api.GET("/expenses/:id", expenseHandler.GetByID)
		api.POST("/expenses", expenseHandler.Create)
		api.PUT("/expenses/:id", expenseHandler.Update)
		api.DELETE("/expenses/:id", expenseHandler.Delete)

		// Recorded Income (الإيرادات المسجلة)
		api.GET("/income", incomeHandler.GetAll)
		api.GET("/income/:id", incomeHandler.GetByID)
		api.POST("/income", incomeHandler.Create)
		api.PUT("/income/:id", incomeHandler.Update)
		api.DELETE("/income/:id", incomeHandler.Delete)

		// Expense Types
		api.GET("/expense-types", typeHandler.GetAllExpenseTypes)
		api.POST("/expense-types", typeHandler.CreateExpenseType)
		api.PUT("/expense-types/:id", typeHandler.UpdateExpenseType)
		api.DELETE("/expense-types/:id", typeHandler.DeleteExpenseType)

		// Income Types
		api.GET("/income-types", typeHandler.GetAllIncomeTypes)
		api.POST("/income-types", typeHandler.CreateIncomeType)
		api.PUT("/income-types/:id", typeHandler.UpdateIncomeType)
		api.DELETE("/income-types/:id", typeHandler.DeleteIncomeType)

		// Statistics
		api.GET("/statistics", statsHandler.GetStatistics)
		api.GET("/statistics/expenses-by-category/:type_id", statsHandler.GetCategoryExpenseTransactions)
		api.GET("/statistics/incomes-by-category/:type_id", statsHandler.GetCategoryIncomeTransactions)
	}

	// Serve Static Frontend (React SPA) when frontend/dist folder exists
	distDir := "./frontend/dist"
	if _, err := os.Stat(distDir); err == nil {
		r.Static("/assets", filepath.Join(distDir, "assets"))

		// Route all non-API GET requests to index.html
		r.NoRoute(func(c *gin.Context) {
			if strings.HasPrefix(c.Request.URL.Path, "/api") {
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"message": "API route not found",
				})
				return
			}

			// Check if file exists in dist (e.g. favicon, images)
			requestedPath := filepath.Join(distDir, filepath.Clean(c.Request.URL.Path))
			if info, err := os.Stat(requestedPath); err == nil && !info.IsDir() {
				c.File(requestedPath)
				return
			}

			// SPA Fallback
			c.File(filepath.Join(distDir, "index.html"))
		})
	}

	return r
}
