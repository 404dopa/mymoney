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

type CardHandler struct {
	cardRepo    *repository.CardRepository
	expenseRepo *repository.ExpenseRepository
	incomeRepo  *repository.IncomeRepository
	typeRepo    *repository.TypeRepository
}

func NewCardHandler(
	cardRepo *repository.CardRepository,
	expenseRepo *repository.ExpenseRepository,
	incomeRepo *repository.IncomeRepository,
	typeRepo *repository.TypeRepository,
) *CardHandler {
	return &CardHandler{
		cardRepo:    cardRepo,
		expenseRepo: expenseRepo,
		incomeRepo:  incomeRepo,
		typeRepo:    typeRepo,
	}
}

// ------------------- Expense Cards -------------------

func (h *CardHandler) GetAllExpenseCards(c *gin.Context) {
	cards, err := h.cardRepo.GetAllExpenseCards()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب بطاقات المصاريف"))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(cards))
}

func (h *CardHandler) CreateExpenseCard(c *gin.Context) {
	var req models.CreateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات البطاقة غير صالحة أو غير مكتملة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم بطاقة المصروف (مثال: بنزين، طعام)"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	t, err := h.typeRepo.GetExpenseTypeByID(req.TypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع المصروف المحدد غير موجود"))
		return
	}

	card, err := h.cardRepo.CreateExpenseCard(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل إنشاء بطاقة المصروف"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(card, "تم إنشاء بطاقة المصروف بنجاح"))
}

func (h *CardHandler) UpdateExpenseCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	var req models.UpdateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات التعديل غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم بطاقة المصروف"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	t, err := h.typeRepo.GetExpenseTypeByID(req.TypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع المصروف المحدد غير موجود"))
		return
	}

	card, err := h.cardRepo.UpdateExpenseCard(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تعديل بطاقة المصروف"))
		return
	}
	if card == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة المصروف غير موجودة"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(card, "تم تعديل بطاقة المصروف بنجاح"))
}

func (h *CardHandler) DeleteExpenseCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	err = h.cardRepo.DeleteExpenseCard(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة المصروف غير موجودة"))
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حذف بطاقة المصروف"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف بطاقة المصروف بنجاح"))
}

// RecordExpenseFromCard: 1-Tap instant recording!
func (h *CardHandler) RecordExpenseFromCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	card, err := h.cardRepo.GetExpenseCardByID(id)
	if err != nil || card == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة المصروف غير موجودة"))
		return
	}

	// Create transaction with card's data and current date
	today := time.Now().Format("2006-01-02")
	txReq := &models.CreateExpenseRequest{
		Name:          card.Name,
		Amount:        card.Amount,
		ExpenseTypeID: card.ExpenseTypeID,
		ExpenseDate:   today,
		Note:          "مسجل من البطاقة السريعة",
	}

	recorded, err := h.expenseRepo.CreateExpense(txReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تسجيل المصروف"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(recorded, "تم تسجيل المصروف بنجاح!"))
}

// ------------------- Income Cards -------------------

func (h *CardHandler) GetAllIncomeCards(c *gin.Context) {
	cards, err := h.cardRepo.GetAllIncomeCards()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب بطاقات الإيرادات"))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(cards))
}

func (h *CardHandler) CreateIncomeCard(c *gin.Context) {
	var req models.CreateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات البطاقة غير صالحة أو غير مكتملة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم بطاقة الإيراد"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	t, err := h.typeRepo.GetIncomeTypeByID(req.TypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع الإيراد المحدد غير موجود"))
		return
	}

	card, err := h.cardRepo.CreateIncomeCard(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل إنشاء بطاقة الإيراد"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(card, "تم إنشاء بطاقة الإيراد بنجاح"))
}

func (h *CardHandler) UpdateIncomeCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	var req models.UpdateCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات التعديل غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم بطاقة الإيراد"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	t, err := h.typeRepo.GetIncomeTypeByID(req.TypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع الإيراد المحدد غير موجود"))
		return
	}

	card, err := h.cardRepo.UpdateIncomeCard(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تعديل بطاقة الإيراد"))
		return
	}
	if card == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة الإيراد غير موجودة"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(card, "تم تعديل بطاقة الإيراد بنجاح"))
}

func (h *CardHandler) DeleteIncomeCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	err = h.cardRepo.DeleteIncomeCard(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة الإيراد غير موجودة"))
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حذف بطاقة الإيراد"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف بطاقة الإيراد بنجاح"))
}

// RecordIncomeFromCard: 1-Tap instant recording!
func (h *CardHandler) RecordIncomeFromCard(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف البطاقة غير صالح"))
		return
	}

	card, err := h.cardRepo.GetIncomeCardByID(id)
	if err != nil || card == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("بطاقة الإيراد غير موجودة"))
		return
	}

	today := time.Now().Format("2006-01-02")
	txReq := &models.CreateIncomeRequest{
		Name:         card.Name,
		Amount:       card.Amount,
		IncomeTypeID: card.IncomeTypeID,
		IncomeDate:   today,
		Note:         "مسجل من البطاقة السريعة",
	}

	recorded, err := h.incomeRepo.CreateIncome(txReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تسجيل الإيراد"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(recorded, "تم تسجيل الإيراد بنجاح!"))
}
