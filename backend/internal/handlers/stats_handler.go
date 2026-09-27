package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"moneytrack/internal/models"
	"moneytrack/internal/repository"
)

type StatsHandler struct {
	statsRepo   *repository.StatsRepository
	expenseRepo *repository.ExpenseRepository
	incomeRepo  *repository.IncomeRepository
}

func NewStatsHandler(
	statsRepo *repository.StatsRepository,
	expenseRepo *repository.ExpenseRepository,
	incomeRepo *repository.IncomeRepository,
) *StatsHandler {
	return &StatsHandler{
		statsRepo:   statsRepo,
		expenseRepo: expenseRepo,
		incomeRepo:  incomeRepo,
	}
}

func (h *StatsHandler) GetStatistics(c *gin.Context) {
	month := c.Query("month")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	typeIDParam := c.Query("expense_type_id")

	var typeID int64
	if typeIDParam != "" {
		typeID, _ = strconv.ParseInt(typeIDParam, 10, 64)
	}

	stats, err := h.statsRepo.GetStatistics(month, startDate, endDate, typeID)
	if err != nil {
		log.Printf("ERROR in GetStatistics: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(fmt.Sprintf("حدث خطأ أثناء حساب الإحصائيات: %v", err)))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(stats))
}

func (h *StatsHandler) GetCategoryExpenseTransactions(c *gin.Context) {
	typeIDParam := c.Param("type_id")
	typeID, err := strconv.ParseInt(typeIDParam, 10, 64)
	if err != nil || typeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع المصروف غير صالح"))
		return
	}

	month := c.Query("month")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	expenses, err := h.expenseRepo.GetAllExpenses(month, startDate, endDate, typeID, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب تفاصيل معاملات هذا النوع"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(expenses))
}

func (h *StatsHandler) GetCategoryIncomeTransactions(c *gin.Context) {
	typeIDParam := c.Param("type_id")
	typeID, err := strconv.ParseInt(typeIDParam, 10, 64)
	if err != nil || typeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع الإيراد غير صالح"))
		return
	}

	month := c.Query("month")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	incomes, err := h.incomeRepo.GetAllIncomes(month, startDate, endDate, typeID, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب تفاصيل معاملات هذا النوع"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(incomes))
}

