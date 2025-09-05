<template>
  <md-dialog ref="dlg" class="confirm-delete-dialog">
    <span slot="headline" class="cd-headline">Hapus Diskon</span>

    <div slot="content" class="cd-content">
      <p v-if="name">
        Apakah Anda yakin ingin menghapus diskon <strong>{{ name }}</strong
        >?
      </p>
      <p v-else>Apakah Anda yakin ingin menghapus diskon yang dipilih?</p>
      <ul class="cd-notes">
        <li>Diskon yang dihapus tidak bisa dikembalikan lagi.</li>
      </ul>
    </div>

    <div slot="actions" class="cd-actions">
      <md-outlined-button class="cd-cancel" :disabled="busy" @click="cancel"
        >Batalkan</md-outlined-button
      >
      <md-filled-button class="cd-delete" :disabled="busy" @click="confirm">
        {{ busy ? 'Menghapus…' : 'Hapus' }}
      </md-filled-button>
    </div>
  </md-dialog>
</template>

<script>
import '@material/web/dialog/dialog.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/filled-button.js'

export default {
  name: 'ConfirmDeleteDialog',
  props: { name: { type: String, default: '' } },
  data: () => ({ busy: false }),
  methods: {
    open() {
      this.$refs.dlg?.show()
    },
    close() {
      this.$refs.dlg?.close()
    },
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
      this.close()
    },
    setBusy(v) {
      this.busy = !!v
    },
  },
}
</script>


<style scoped>
.confirm-delete-dialog {
  --md-dialog-container-color: #fff;
}
.cd-headline {
  font-size: 22px;
  font-weight: 700;
}
.cd-content p {
  margin: 0 0 8px;
  color: #212426;
}
.cd-notes {
  margin: 0;
  padding-left: 18px;
  color: #4b5258;
}
.cd-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Buttons styling to match the mock */
.cd-cancel {
  --md-outlined-button-container-shape: 20px;
  --md-outlined-button-label-text-font: system-ui;
  --md-sys-color-primary: #ff3553;
  --md-sys-color-outline: #fff;
  border-radius: 20px;
  border: 1px solid #ff3553;
}

.cd-delete {
  --md-filled-button-container-shape: 9999px;
  --md-sys-color-primary: #ff3553;
  --md-sys-color-on-primary: #ffffff;
  border-radius: 9999px;
}
</style>
