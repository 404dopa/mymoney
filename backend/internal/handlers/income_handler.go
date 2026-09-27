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

type IncomeHandler struct {
	repo     *repository.IncomeRepository
	typeRepo *repository.TypeRepository
}

func NewIncomeHandler(repo *repository.IncomeRepository, typeRepo *repository.TypeRepository) *IncomeHandler {
	return &IncomeHandler{
		repo:     repo,
		typeRepo: typeRepo,
	}
}

func (h *IncomeHandler) GetAll(c *gin.Context) {
	month := c.Query("month")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	typeIDParam := c.Query("type_id")
	search := c.Query("search")

	var typeID int64
	if typeIDParam != "" {
		typeID, _ = strconv.ParseInt(typeIDParam, 10, 64)
	}

	incomes, err := h.repo.GetAllIncomes(month, startDate, endDate, typeID, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب قائمة الإيرادات"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(incomes))
}

func (h *IncomeHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف الإيراد غير صالح"))
		return
	}

	income, err := h.repo.GetIncomeByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب تفاصيل الإيراد"))
		return
	}
	if income == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("الإيراد غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(income))
}

func (h *IncomeHandler) Create(c *gin.Context) {
	var req models.CreateIncomeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات الإدخال غير مكتملة أو غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم الإيراد"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	if req.IncomeTypeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى تحديد نوع الإيراد"))
		return
	}

	t, err := h.typeRepo.GetIncomeTypeByID(req.IncomeTypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع الإيراد المحدد غير موجود"))
		return
	}

	if req.IncomeDate == "" {
		req.IncomeDate = time.Now().Format("2006-01-02")
	} else {
		if _, err := time.Parse("2006-01-02", req.IncomeDate); err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse("صيغة التاريخ غير صحيحة، يرجى استخدام YYYY-MM-DD"))
			return
		}
	}

	income, err := h.repo.CreateIncome(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حفظ الإيراد في قاعدة البيانات"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(income, "تم حفظ الإيراد بنجاح"))
}

func (h *IncomeHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف الإيراد غير صالح"))
		return
	}

	var req models.UpdateIncomeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("بيانات الإدخال غير صالحة"))
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم الإيراد"))
		return
	}

	if req.Amount.IsNegative() {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("لا يمكن أن يكون المبلغ سالباً"))
		return
	}

	if req.IncomeTypeID <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى تحديد نوع الإيراد"))
		return
	}

	t, err := h.typeRepo.GetIncomeTypeByID(req.IncomeTypeID)
	if err != nil || t == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("نوع الإيراد المحدد غير موجود"))
		return
	}

	if _, err := time.Parse("2006-01-02", req.IncomeDate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("صيغة التاريخ غير صحيحة، يرجى استخدام YYYY-MM-DD"))
		return
	}

	income, err := h.repo.UpdateIncome(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تحديث بيانات الإيراد"))
		return
	}
	if income == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("الإيراد غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(income, "تم تعديل الإيراد بنجاح"))
}

func (h *IncomeHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف الإيراد غير صالح"))
		return
	}

	err = h.repo.DeleteIncome(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("الإيراد غير موجود"))
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل حذف الإيراد"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف الإيراد بنجاح"))
}
