<template>
  <div>
    <div class="page-wrapper">
      <AlertDialog ref="alert" />
      <ConfirmDeleteDialog
        ref="confirmDelete"
        :name="confirmDeleteName"
        @confirm="bulkDeleteConfirmed"
        @cancel="bulkDeleteCancelled"
      />
      <DiscountDialog
        ref="dlg"
        :api-url="apiUrl"
        :notify="notify"
        @saved="onDialogSaved"
        @deleted="onDialogDeleted"
      />

      <div class="container nds-spacing-24x fg-primary nds-border-radius-28x">
        <div class="wrapper">
          <div class="head d-flex flex-wrap justify-content-between align-items-center">
            <div class="title-discount-total">
              <h1 class="fz-lg w-100 pt-0 pb-0" style="font-weight: 600">Daftar Diskon</h1>
              <p v-if="discountTotal" style="color: #869098; margin: 0">
                Total jumlah diskon: {{ discountTotal }}
              </p>
            </div>

            <div class="control-btn">
              <!-- CREATE -->
              <md-filled-button
                v-if="discounts.length > 0 && !isDeleteItemSelected"
                class="add-discount-btn"
                @click="openCreateDialog"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 4H6V1C6 0.45 5.55 0 5 0C4.45 0 4 0.45 4 1V4H1C0.45 4 0 4.45 0 5C0 5.55 0.45 6 1 6H4V9C4 9.55 4.45 10 5 10C5.55 10 6 9.55 6 9V6H9C9.55 6 10 5.55 10 5C10 4.45 9.55 4 9 4Z"
                    fill="white"
                  />
                </svg>
                Buat Diskon
              </md-filled-button>

              <div v-if="isDeleteItemSelected" class="delete-confirm d-flex" style="gap: 8px">
                <md-outlined-button class="cancel-delete-btn" @click="cancelBulkSelection"
                  >Batalkan</md-outlined-button
                >
                <md-filled-button class="confirm-delete-btn" @click="openBulkDeleteConfirm"
                  >Hapus</md-filled-button
                >
              </div>
            </div>
          </div>

          <!-- Search & Filter -->
          <div
            class="search-filter d-flex flex-wrap w-100 justify-content-start align-items-center mt-2"
            style="gap: 10px"
          >
            <div class="search-bar" v-if="discounts.length > 0">
              <MagnifyIcon fillColor="#869098" />
              <input class="search-bar" type="text" placeholder="Cari diskon" v-model="search" />
            </div>

            <!-- API source dropdown -->
            <span class="fetch-api" style="position: relative">
              <button
                ref="apiBtn"
                class="btn filter-btn d-flex w-sm-100"
                style="gap: 6px"
                @click="toggleApiMenu"
              >
                <TokoIcon />
                {{ storeLabel }}
                <md-icon class="chevron-icon">keyboard_arrow_down</md-icon>
              </button>

              <md-menu ref="apiMenu">
                <md-menu-item keep-open>
                  <div slot="headline" style="min-width: 320px; width: 100%">
                    <md-outlined-text-field
                      class="api-input w-100 mb-1 p-2"
                      label="API URL crudcrud.com"
                      :value="apiUrlDraft"
                      @input="apiUrlDraft = $event.target.value"
                      :disabled="isDisabled"
                    />
                  </div>
                </md-menu-item>

                <md-menu-item>
                  <div slot="headline" class="p-2" style="width: 100%">
                    <md-filled-button
                      :disabled="isDisabled"
                      class="add-discount-btn w-100"
                      @click="applyApiUrl"
                    >
                      Terapkan
                    </md-filled-button>
                  </div>
                </md-menu-item>
              </md-menu>
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="table-container mt-2" v-if="discounts.length > 0">
          <div class="mdc-data-table w-100" ref="table">
            <div class="mdc-data-table__table-container">
              <table class="mdc-data-table__table" aria-label="Daftar Diskon">
                <thead>
                  <tr class="mdc-data-table__header-row">
                    <th
                      class="mdc-data-table__header-cell mdc-data-table__header-cell--checkbox"
                      role="columnheader"
                      scope="col"
                    >
                      <input
                        class="check-delete"
                        type="checkbox"
                        v-model="selectAll"
                        @change="toggleAll"
                      />
                    </th>
                    <th
                      class="mdc-data-table__header-cell sortable"
                      scope="col"
                      @click="toggleSort('discount_name')"
                      :aria-sort="
                        sortKey === 'discount_name'
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      "
                    >
                      Nama Diskon
                      <md-icon class="sort-icon" :class="{ active: sortKey === 'discount_name' }">
                        {{ sortIcon('discount_name') }}
                      </md-icon>
                    </th>

                    <th class="mdc-data-table__header-cell" scope="col">Nilai Diskon</th>
                    <th class="mdc-data-table__header-cell" scope="col"></th>
                  </tr>
                </thead>

                <tbody class="mdc-data-table__content">
                  <tr
                    v-for="item in paginatedDiscounts"
                    :key="item._id"
                    class="mdc-data-table__row"
                  >
                    <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                      <input type="checkbox" v-model="selected" :value="item._id" />
                    </td>
                    <td class="mdc-data-table__cell">
                      {{ item.discount_name }}
                      <span
                        v-if="item.isNew"
                        class="tag-new badge"
                        style="border: 2px solid #9ae4fd; color: #9ae4fd; border-radius: 10px"
                        >baru</span
                      >
                    </td>
                    <td class="mdc-data-table__cell">{{ formattedValue(item) }}</td>
                    <td class="mdc-data-table__cell text-end">
                      <!-- EDIT -->
                      <EditIcon style="cursor: pointer" @click="editItem(item)" />
                    </td>
                  </tr>
                  <tr v-if="paginatedDiscounts.length === 0">
                    <td class="text-center" colspan="4">
                      <p>Tidak ditemukan data yang cocok</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <div class="page-size">
              <select v-model="perPage" class="page-size-select">
                <option v-for="n in [5, 10, 20]" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="page-size-label">data per halaman</span>
            </div>

            <div class="page-numbers">
              <button class="page-arrow" @click="prevPage" :disabled="page === 1">‹</button>

              <div v-for="(n, idx) in pagesToShow" :key="`p-${idx}-${n}`">
                <span v-if="n === '...'" class="page-ellipsis">…</span>
                <button v-else class="page-btn" :class="{ active: page === n }" @click="page = n">
                  {{ n }}
                </button>
              </div>

              <button class="page-arrow" @click="nextPage" :disabled="page === totalPages">
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="empty-state d-flex flex-column justify-content-center align-items-center mt-4"
        >
          <img src="/empty_state.png" alt="empty state" style="max-width: 100%; width: 200px" />
          <h2 class="fw-bold">Belum ada diskon</h2>
          <p style="color: #212426; max-width: 300px; text-align: center">
            Silahkan tambah diskon untuk menarik pelanggan dan meningkatakan penjualan.
          </p>
          <md-filled-button class="add-discount-btn" @click="openCreateDialog">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 4H6V1C6 0.45 5.55 0 5 0C4.45 0 4 0.45 4 1V4H1C0.45 4 0 4.45 0 5C0 5.55 0.45 6 1 6H4V9C4 9.55 4.45 10 5 10C5.55 10 6 9.55 6 9V6H9C9.55 6 10 5.55 10 5C10 4.45 9.55 4 9 4Z"
                fill="white"
              />
            </svg>
            Tambah Diskon
          </md-filled-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
import TokoIcon from '@/icons/TokoIcon.vue'
import EditIcon from '@/icons/EditIcon.vue'
import DiscountDialog from '@/components/DiscountDialog.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import AlertDialog from '@/components/AlertDialog.vue'
import { MDCDataTable } from '@material/data-table'
import axios from 'axios'

export default {
  name: 'Home',
  components: { MagnifyIcon, TokoIcon, EditIcon, DiscountDialog, ConfirmDeleteDialog, AlertDialog },
  data() {
    return {
      discounts: [],
      selected: [],
      selectAll: false,
      search: '',
      page: 1,
      perPage: 10,
      apiUrl: '',
      apiUrlDraft: 'https://crudcrud.com/api/f1e7ac44b3f643b6a4bee0559ccb19d0/discounts',
      storeLabel: 'Kopi Anak Bangsa',
      isDisabled: false,
      sortKey: 'discount_name',
      sortDir: 'asc',
    }
  },
  computed: {
    formattedValue() {
      return (item) => {
        const raw =
          typeof item.value === 'string'
            ? Number(String(item.value).replace(/[^\d.-]/g, '')) || 0
            : item.value ?? 0
        const type =
          item.type ||
          (typeof item.value === 'string' && String(item.value).includes('%')
            ? 'percent'
            : 'amount')
        return type === 'percent' ? `${raw}%` : `Rp ${new Intl.NumberFormat('id-ID').format(raw)}`
      }
    },

    isDeleteItemSelected() {
      return this.selected.length > 0
    },

    discountTotal() {
      return this.discounts.length
    },

    // 1) Filter (use empty string fallback, not "test")
    filteredDiscounts() {
      return this.discounts.filter((d) =>
        (d.discount_name || '').toLowerCase().includes(this.search.toLowerCase())
      )
    },

    // 2) Sort filtered list
    sortedDiscounts() {
      const arr = [...this.filteredDiscounts]
      if (this.sortKey === 'discount_name') {
        const dir = this.sortDir === 'asc' ? 1 : -1
        arr.sort((a, b) => {
          const an = (a.discount_name || '').toString()
          const bn = (b.discount_name || '').toString()
          return an.localeCompare(bn, 'id-ID', { sensitivity: 'base' }) * dir
        })
      }
      return arr
    },

    // 3) Compute total pages from the *sorted* list
    totalPages() {
      return Math.ceil(this.sortedDiscounts.length / this.perPage) || 1
    },

    // 4) Paginate the *sorted* list (only one definition!)
    paginatedDiscounts() {
      const start = (this.page - 1) * this.perPage
      return this.sortedDiscounts.slice(start, start + this.perPage)
    },

    // (unchanged) compact page-number model
    pagesToShow() {
      const total = this.totalPages
      const p = this.page
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

      const out = [1]
      const start = Math.max(2, p - 1)
      const end = Math.min(total - 1, p + 1)
      if (start > 2) out.push('...')
      for (let i = start; i <= end; i++) out.push(i)
      if (end < total - 1) out.push('...')
      out.push(total)
      return out
    },
  },

  watch: {
    perPage() {
      this.page = 1
    },
    search() {
      this.page = 1
    },
  },
  mounted() {
    this.$refs.apiMenu.anchorElement = this.$refs.apiBtn
    if (this.$refs.table) new MDCDataTable(this.$refs.table)
  },
  methods: {
    async fetchDiscounts() {
      if (!this.apiUrl) return
      try {
        const { data } = await axios.get(this.apiUrl)
        this.discounts = data.map((d, i, arr) => ({ ...d, isNew: i === arr.length - 1 }))
      } catch (error) {
        console.error('Error fetching discounts:', error)
      }
    },
    notify(msg, type = 'success', ms = 3000) {
      this.$refs.alert?.show(msg, type, ms)
    },
    toggleSort(key) {
      if (this.sortKey !== key) {
        this.sortKey = key
        this.sortDir = 'asc'
      } else {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      }
      this.page = 1
    },
    sortIcon(key) {
      if (this.sortKey !== key) return 'unfold_more'
      return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'
    },

    openCreateDialog() {
      if (!this.apiUrl) {
        this.notify(`Silahkan masukan/terapkan API URL terlebih dahulu`, 'info')
        return
      }
      this.$refs.dlg.openCreate()
    },
    editItem(item) {
      this.$refs.dlg.openEdit(item)
    },
    async onDialogSaved() {
      await this.fetchDiscounts()
    },

    toggleApiMenu() {
      this.$refs.apiMenu.open = !this.$refs.apiMenu.open
    },
    async applyApiUrl() {
      const url = (this.apiUrlDraft || '').trim().replace(/\/+$/, '') // strip trailing slash
      if (!url) {
        alert('Masukkan API URL.')
        return
      }

      this.isDisabled = true
      this.apiUrl = url
      this.$refs.apiMenu.open = false
      await this.fetchDiscounts()
    },

    toggleAll() {
      const idsOnPage = this.paginatedDiscounts.map((d) => d._id || d.id)
      this.selected = this.selectAll ? idsOnPage : []
    },
    openBulkDeleteConfirm() {
      if (!this.selected.length) return
      this.$refs.confirmDelete.open()
    },
    cancelBulkSelection() {
      this.selectAll = false
      this.selected = []
    },
    async bulkDeleteConfirmed() {
      if (!this.apiUrl || !this.selected.length) return
      this.$refs.confirmDelete.setBusy(true)
      try {
        await Promise.allSettled(this.selected.map((id) => axios.delete(`${this.apiUrl}/${id}`)))
        await this.fetchDiscounts()
        this.selected = []
        this.selectAll = false
        this.notify(`Diskon berhasil dihapus.`, 'success')
      } catch (e) {
        console.error(e)
        this.notify(`Diskon gagal dihapus.`, 'error')
      } finally {
        this.$refs.confirmDelete.setBusy(false)
        this.$refs.confirmDelete.close()
      }
    },

    prevPage() {
      if (this.page > 1) this.page--
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++
    },
    async onDialogSaved() {
      await this.fetchDiscounts()
    },
    async onDialogDeleted() {
      await this.fetchDiscounts()
    },
  },
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  min-height: 100vh;
  background-color: #f4f5f6;
  box-sizing: border-box;
}
.container {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
}
.wrapper {
  margin: 0 auto;
}
.fz-lg {
  font-size: 2rem;
}
.fw-bold {
  font-weight: bold;
}

.chevron-icon {
  font-size: 20px;
}
.search-bar {
  width: max-content;
  display: flex;
  padding: 0px 10px;
  align-items: center;
  border: 1px solid #cdd2d5;
  border-radius: 30px;
}
.search-bar input {
  border: none;
  outline: none;
  padding: 8px 16px;
  border-radius: 30px;
  width: 200px;
}
.filter-btn {
  border: 1px solid #cdd2d5;
  font-size: 14px;
  border-radius: 10px;
  padding: 8px 16px;
  color: #4b5258;
}
.empty-state {
  border: 1px solid #ecedef;
  border-radius: 20px;
  padding: 30px;
}
.empty-state h2 {
  font-size: 22px;
  font-weight: 600;
}
.empty-state p {
  font-size: 12px;
}
.mdc-data-table {
  border-radius: 20px;
  padding: 5px;
}
.add-discount-btn {
  --md-filled-button-container-shape: 0px;
  --md-filled-button-label-text-font: system-ui;
  --md-filled-button-label-text-color: #fff;
  --md-sys-color-primary: #3dae2f;
  --md-sys-color-on-primary: #ffffff;
  border-radius: 20px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sort-icon {
  font-size: 14px;
  margin-left: 6px;
  opacity: 0.5;
  vertical-align: middle;
}
.sort-icon.active {
  opacity: 1;
  color: #4b5258;
}
.confirm-delete-btn {
  --md-filled-button-container-shape: 0px;
  --md-filled-button-label-text-font: system-ui;
  --md-filled-button-label-text-color: #fff;
  --md-filled-button-container-color: #ff3553;
  --md-sys-color-on-primary: #ffffff;
  border-radius: 20px;
}
.cancel-delete-btn {
  --md-outlined-button-container-shape: 20px;
  --md-outlined-button-label-text-font: system-ui;
  --md-sys-color-primary: #ff3553;
  --md-sys-color-outline: #fff;
  border-radius: 20px;
  border: 1px solid #ff3553;
}

.api-input {
  --md-outlined-text-field-outline-color: #cdd2d5;
  --md-outlined-text-field-focus-outline-color: #3dae2f;
  --md-sys-color-primary: #3dae2f;
}
.check-delete {
  background-color: #3dae2f;
}

.tag-new {
  --md-ouutlined-button-container-height: 50px;
  --md-outlined-button-label-text-font: system-ui;
  --md-sys-color-primary: #3dae2f;
  --md-sys-color-outline: #3dae2f;

  font-size: 10px;
}

/* Pagination layout */
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

/* Left side: page size pill + label */
.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #869098;
}

.page-size-select {
  appearance: none;
  border: 1px solid #cdd2d5;
  background: #fff;
  border-radius: 10px;
  padding: 6px 28px 6px 10px;
  line-height: 1;
  font-weight: 600;
  color: #4b5258;
}

/* Right side: pager */
.page-numbers {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Reset buttons to look like text/circles */
.page-btn,
.page-arrow {
  border: 0;
  background: transparent;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5258;
  cursor: pointer;
}

.page-btn:hover {
  background: #ecf6ee; /* light green tint */
}

.page-btn.active {
  background: #3dae2f;
  color: #fff;
}

.page-arrow {
  color: #98a2a8;
}
.page-arrow:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-ellipsis {
  color: #98a2a8;
  padding: 0 2px;
}
</style>
