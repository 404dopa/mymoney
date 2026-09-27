package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"moneytrack/internal/models"
	"moneytrack/internal/repository"
)

type TypeHandler struct {
	repo *repository.TypeRepository
}

func NewTypeHandler(repo *repository.TypeRepository) *TypeHandler {
	return &TypeHandler{repo: repo}
}

// ------------------- Expense Types Handlers -------------------

func (h *TypeHandler) GetAllExpenseTypes(c *gin.Context) {
	types, err := h.repo.GetAllExpenseTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب أنواع المصاريف"))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(types))
}

func (h *TypeHandler) CreateExpenseType(c *gin.Context) {
	var req models.CreateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم نوع المصروف"))
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("اسم نوع المصروف لا يمكن أن يكون فارغاً"))
		return
	}

	t, err := h.repo.CreateExpenseType(name)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" { // unique_violation
			c.JSON(http.StatusConflict, models.ErrorResponse("نوع المصروف هذا موجود بالفعل"))
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل إنشاء نوع المصروف"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(t, "تم إنشاء نوع المصروف بنجاح"))
}

func (h *TypeHandler) UpdateExpenseType(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع المصروف غير صالح"))
		return
	}

	var req models.UpdateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم نوع المصروف الجديد"))
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("اسم نوع المصروف لا يمكن أن يكون فارغاً"))
		return
	}

	t, err := h.repo.UpdateExpenseType(id, name)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			c.JSON(http.StatusConflict, models.ErrorResponse("نوع المصروف هذا موجود بالفعل"))
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تحديث نوع المصروف"))
		return
	}
	if t == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("نوع المصروف غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(t, "تم تحديث نوع المصروف بنجاح"))
}

func (h *TypeHandler) DeleteExpenseType(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع المصروف غير صالح"))
		return
	}

	err = h.repo.DeleteExpenseType(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("نوع المصروف غير موجود"))
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف نوع المصروف بنجاح"))
}

// ------------------- Income Types Handlers -------------------

func (h *TypeHandler) GetAllIncomeTypes(c *gin.Context) {
	types, err := h.repo.GetAllIncomeTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("حدث خطأ أثناء جلب أنواع الإيرادات"))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(types))
}

func (h *TypeHandler) CreateIncomeType(c *gin.Context) {
	var req models.CreateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم نوع الإيراد"))
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("اسم نوع الإيراد لا يمكن أن يكون فارغاً"))
		return
	}

	t, err := h.repo.CreateIncomeType(name)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			c.JSON(http.StatusConflict, models.ErrorResponse("نوع الإيراد هذا موجود بالفعل"))
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل إنشاء نوع الإيراد"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessage(t, "تم إنشاء نوع الإيراد بنجاح"))
}

func (h *TypeHandler) UpdateIncomeType(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع الإيراد غير صالح"))
		return
	}

	var req models.UpdateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("يرجى إدخال اسم نوع الإيراد الجديد"))
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("اسم نوع الإيراد لا يمكن أن يكون فارغاً"))
		return
	}

	t, err := h.repo.UpdateIncomeType(id, name)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			c.JSON(http.StatusConflict, models.ErrorResponse("نوع الإيراد هذا موجود بالفعل"))
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse("فشل تحديث نوع الإيراد"))
		return
	}
	if t == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse("نوع الإيراد غير موجود"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(t, "تم تحديث نوع الإيراد بنجاح"))
}

func (h *TypeHandler) DeleteIncomeType(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse("معرّف نوع الإيراد غير صالح"))
		return
	}

	err = h.repo.DeleteIncomeType(id)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, models.ErrorResponse("نوع الإيراد غير موجود"))
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessage(nil, "تم حذف نوع الإيراد بنجاح"))
}
