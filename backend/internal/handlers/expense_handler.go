package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"moneytrack/internal/models"
	"moneytrack/internal/repository"
)

type ExpenseHandler struct {
	repo     *repository.ExpenseRepository
	typeRepo *repository.TypeRepository
}

func NewExpenseHandler(repo *repository.ExpenseRepository, typeRepo *repository.TypeRepository) *ExpenseHandler {
	return &ExpenseHandler{
		repo:     repo,
		typeRepo: typeRepo,
	}
}

func (h *ExpenseHandler) GetAll(c *gin.Context) {
	month := c.Query("month")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	typeIDParam := c.Query("type_id")
	search := c.Query("search")

	var typeID int64
	if typeIDParam != "" {
		typeID, _ = strconv.ParseInt(typeIDParam, 10, 64)
	}

	expenses, err := h.repo.GetAllExpenses(month, startDate, endDate, typeID, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب قائمة المصاريف"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(expenses))
}

func (h *ExpenseHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف المصروف غير صالح"))
		return
	}

	expense, err := h.repo.GetExpenseByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب تفاصيل المصروف"))
		return
	}
	if expense == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("المصروف غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(expense))
}

func (h *ExpenseHandler) Create(c *gin.Context) {
	var req models.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات الإدخال غير مكتملة أو غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم المصروف"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	if req.ExpenseTypeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى تحديد نوع المصروف"))
		return
	}

	// Verify expense type exists
	t, err := h.typeRepo.GetExpenseTypeByID(req.ExpenseTypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع المصروف المحدد غير موجود"))
		return
	}

	// Validate date format YYYY-MM-DD
	if req.ExpenseDate == "" {
		req.ExpenseDate = time.Now().Format("2006-01-02")
	} else {
		if _, err := time.Parse("2006-01-02", req.ExpenseDate); err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse("صيغة التاريخ غير صحيحة، يرجى استخدام YYYY-MM-DD"))
			return
		}
	}

	expense, err := h.repo.CreateExpense(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حفظ المصروف في قاعدة البيانات"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(expense, "تم حفظ المصروف بنجاح"))
}

func (h *ExpenseHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف المصروف غير صالح"))
		return
	}

	var req models.UpdateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات الإدخال غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم المصروف"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	if req.ExpenseTypeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى تحديد نوع المصروف"))
		return
	}

	t, err := h.typeRepo.GetExpenseTypeByID(req.ExpenseTypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع المصروف المحدد غير موجود"))
		return
	}

	if _, err := time.Parse("2006-01-02", req.ExpenseDate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("صيغة التاريخ غير صحيحة، يرجى استخدام YYYY-MM-DD"))
		return
	}

	expense, err := h.repo.UpdateExpense(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تحديث بيانات المصروف"))
		return
	}
	if expense == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("المصروف غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(expense, "تم تعديل المصروف بنجاح"))
}

func (h *ExpenseHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف المصروف غير صالح"))
		return
	}

	err = h.repo.DeleteExpense(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("المصروف غير موجود"))
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حذف المصروف"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف المصروف بنجاح"))
}
