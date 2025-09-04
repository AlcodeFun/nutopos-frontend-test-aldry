<template>
  <div>
    <AlertDialog ref="alert" />
 
    <md-dialog ref="dialogRef" class="discount-dialog">
      <span slot="headline" class="dlg-headline">
        <span class="title">{{ isEdit ? 'Edit Diskon' : 'Tambah Diskon' }}</span>
        <md-icon-button toggle @click="close" class="close-btn">
          <md-icon>close</md-icon>
        </md-icon-button>
      </span>

      <form id="discountForm" slot="content" class="dlg-content" @submit.prevent="onSave">
    
        <md-outlined-text-field
          class="discount-name w-full"
          :value="form.discount_name"
          @input="onNameInput($event)"
          label="Nama Diskon"
          placeholder="Misal: Diskon opening, diskon akhir tahun"
          :error="!!errors.name"
          :error-text="errors.name"
        >
         
          <md-icon v-if="errors.name" slot="trailing-icon">error</md-icon>
        </md-outlined-text-field>

     
        <div class="field">
          <div class="discount-row">
            <div class="amount-wrap">
              <md-outlined-text-field
                class="amount-input"
                type="number"
                :min="form.type === 'percent' ? 0 : 0"
                :max="form.type === 'percent' ? 100 : null"
                :value="form.value"
                @input="onValueInput($event)"
                label="Diskon"
                :error="!!errors.value"
                :error-text="errors.value"
                @keydown.stop
              >
                <md-text-icon
                  v-if="form.type === 'percent' && !errors.value"
                  slot="trailing-icon"
                  style="font-size: 16px"
                  >%</md-text-icon
                >
                <md-text-icon
                  v-else-if="form.type === 'amount' && !errors.value"
                  slot="leading-icon"
                  style="font-size: 16px"
                  >Rp</md-text-icon
                >

                <md-icon v-if="errors.value" slot="trailing-icon">error</md-icon>
              </md-outlined-text-field>
            </div>

            <div class="segmented">
              <button
                type="button"
                class="seg-btn seg-btn-left"
                :class="{ active: form.type === 'percent' }"
                @click="form.type = 'percent'"
              >
                <md-icon class="check" v-show="form.type === 'percent'">check</md-icon>
                <span class="m-auto">%</span>
              </button>
              <button
                type="button"
                class="seg-btn seg-btn-right"
                :class="{ active: form.type === 'amount' }"
                @click="form.type = 'amount'"
              >
                <md-icon class="check" v-show="form.type === 'amount'">check</md-icon>
                <span class="m-auto">Rp</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      <div slot="actions" class="dlg-actions d-flex justify-content-between">
        <md-text-button
          v-if="isEdit"
          class="btn-delete"
          type="button"
          :disabled="deleting || saving"
          @click="onDelete"
          >Hapus</md-text-button
        >

        <md-filled-button
          class="btn-save"
          :class="!isEdit ? 'w-100' : ''"
          form="discountForm"
          type="submit"
          :disabled="deleting || saving"
        >
          {{ isEdit ? (saving ? 'Menyimpan…' : 'Perbarui') : saving ? 'Menyimpan…' : 'Simpan' }}
        </md-filled-button>
      </div>
    </md-dialog>
    <!-- confirmation dialog -->
    <ConfirmDeleteDialog
      ref="confirmDelete"
      :name="form.discount_name"
      @confirm="onDeleteConfirmed"
      @cancel="onDeleteCancelled"
    />
  </div>
</template>

<script>
import axios from 'axios'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import AlertDialog from './AlertDialog.vue'

export default {
  name: 'DiscountDialog',
  components: { ConfirmDeleteDialog, AlertDialog },
  props: {
    apiUrl: { type: String, required: true },
    notify: { type: Function, default: null },
  },
  data() {
    return {
      form: {
        _id: null,
        discount_name: '',
        value: 0,
        type: 'percent',
      },
      errors: {
        name: '',
        value: '',
      },
      saving: false,
      deleting: false,
      wasOpenBeforeConfirm: false,
    }
  },
  computed: {
    isEdit() {
      return !!this.form._id
    },
  },
  methods: {
    // Public API
    notifyLocal(msg, type = 'success', ms = 3000) {
      if (typeof this.notify === 'function') {
        this.notify(msg, type, ms)
      } else {
        this.$refs.alert?.show(msg, type, ms)
      }
    },
    openCreate() {
      this.resetForm()
      this.open()
    },
    openEdit(item) {
      const normalizedValue =
        typeof item.value === 'string'
          ? Number(String(item.value).replace(/[^\d.-]/g, '')) || 0
          : Number(item.value) || 0
      const guessedType =
        item.type ||
        (typeof item.value === 'string' && String(item.value).includes('%') ? 'percent' : 'amount')

      this.form = {
        _id: item._id || item.id || null,
        discount_name: item.discount_name || item.name || '',
        value: normalizedValue,
        type: guessedType,
      }
      this.clearErrors()
      this.open()
    },

    onNameInput(e) {
      this.form.discount_name = e.target.value
      if (this.errors.name) this.errors.name = ''
    },
    onValueInput(e) {
      this.form.value = Number(e.target.value || 0)
      if (this.errors.value) this.errors.value = ''
    },

    // Validation
    clearErrors() {
      this.errors.name = ''
      this.errors.value = ''
    },
    runLocalValidation() {
      this.clearErrors()
      let ok = true

      if (!this.form.discount_name || !this.form.discount_name.trim()) {
        this.errors.name = 'Nama diskon tidak boleh kosong'
        ok = false
      }

      if (this.form.value === null || this.form.value === undefined) {
        this.errors.value = 'Diskon tidak boleh kosong'
        ok = false
      }

      if (this.form.value <= 0) {
        this.errors.value = 'Diskon tidak boleh negatif atau nol'
        ok = false
      }
      return ok
    },
    async checkDuplicateName() {
      try {
        const { data } = await axios.get(this.apiUrl)
        const target = (this.form.discount_name || '').trim().toLowerCase()
        const dup = (data || []).some((d) => {
          const name = (d.discount_name || d.name || '').trim().toLowerCase()
          const sameId = d._id === this.form._id // ignore self on edit
          return name === target && !sameId
        })
        if (dup) {
          this.errors.name = 'Nama diskon sudah digunakan, silahkan gunakan nama lain'
          return false
        }
        return true
      } catch (e) {
        // If listing fails, we don't block save on duplicate check
        console.warn('Duplicate check skipped due to error:', e)
        return true
      }
    },

    // CRUD
    async onSave() {
      if (!this.runLocalValidation()) return
      const unique = await this.checkDuplicateName()
      if (!unique) return

      const { _id, ...body } = this.form
      this.saving = true
      try {
        if (this.isEdit) {
          await axios.put(`${this.apiUrl}/${_id}`, body)
          this.notifyLocal(`${this.form.discount_name} berhasil diperbarui.`, 'success')
          this.$emit('saved', { mode: 'update', id: _id, data: body })
        } else {
          const { data } = await axios.post(this.apiUrl, body)
          this.notifyLocal(`${this.form.discount_name} berhasil ditambahkan.`, 'success')
          this.$emit('saved', { mode: 'create', id: data._id, data })
        }
        this.close()
      } catch (e) {
        console.error(e)
        this.notifyLocal('Gagal menyimpan diskon.', 'error', 4000)
      } finally {
        this.saving = false
      }
    },
    onDelete() {
      if (!this.form._id) return
      this.wasOpenBeforeConfirm = true
      this.close()
      this.$refs.confirmDelete.open()
    },

    async onDeleteConfirmed() {
      if (!this.form._id) return
      this.$refs.confirmDelete.setBusy(true)
      try {
        await axios.delete(`${this.apiUrl}/${this.form._id}`)
        this.notifyLocal(`${this.form.discount_name} berhasil dihapus.`, 'success')
        this.$emit('deleted', { id: this.form._id })
        this.$refs.confirmDelete.setBusy(false)
        this.$refs.confirmDelete.close()
        this.wasOpenBeforeConfirm = false
      } catch (e) {
        console.error(e)
        this.$refs.confirmDelete.setBusy(false)
        this.notifyLocal('Gagal menghapus diskon.', 'error', 4000)
      }
    },

    onDeleteCancelled() {
      if (this.wasOpenBeforeConfirm) {
        this.open()
        this.wasOpenBeforeConfirm = false
      }
    },

    open() {
      this.$refs.dialogRef?.show()
    },
    close() {
      this.$refs.dialogRef?.close()
    },
    resetForm() {
      this.form = { _id: null, discount_name: '', value: 0, type: 'percent' }
      this.clearErrors()
    },
  },
}
</script>

<style scoped>
.discount-dialog {
  --md-sys-color-surface-container-highest: #dde4e3;
  --md-sys-color-on-surface: #161d1d;
  --md-sys-color-on-surface-variant: #3f4948;
}
.dlg-headline {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dlg-headline .title {
  font-size: 24px;
  font-weight: 700;
  flex: 1;
}
.dlg-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.w-full {
  width: 100%;
}
.discount-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.amount-wrap {
  position: relative;
  flex: 1;
}
.discount-name {
  --md-outlined-text-field-outline-color: #cdd2d5;
  --md-outlined-text-field-focus-outline-color: #3dae2f;
  --md-sys-color-primary: #3dae2f;
}
.amount-input {
  --md-outlined-text-field-outline-color: #cdd2d5;
  --md-outlined-text-field-focus-outline-color: #3dae2f;
  --md-sys-color-primary: #3dae2f;
}
.suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 600;
}
.segmented {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}
.seg-btn {
  appearance: none;
  background: #fff;
  border: 1px solid #d1d5db;
  min-width: 80px;
  padding: 10px 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.seg-btn-left {
  border-radius: 14px 0 0 14px;
}
.seg-btn-right {
  border-radius: 0 14px 14px 0;
}
.seg-btn + .seg-btn {
  border-left: 1px solid #e5e7eb;
}
.seg-btn.active {
  background: #f0fdf4;
  color: #16a34a;
}
.check {
  font-size: 18px;
}
.dlg-actions {
  width: 100%;
}
.btn-save {
  --md-filled-button-container-shape: 0px;
  --md-filled-button-label-text-font: system-ui;
  --md-filled-button-label-text-color: #fff;
  --md-sys-color-primary: #3dae2f;
  --md-sys-color-on-primary: #ffffff;
  border-radius: 20px;
}

.btn-delete {
  --md-text-button-label-text-font: system-ui;
  --md-sys-color-primary: #ff3553;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}
.close-btn {
  --md-icon-button-icon-color: #4b5258;
}
</style>
