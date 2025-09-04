<template>
  <md-dialog ref="dlg" class="alert-dialog" @closed="visible = false">
    <div slot="content" class="content" :class="kind">
      <span class="msg">{{ message }}</span>
    </div>
  </md-dialog>
</template>

<script>
import '@material/web/dialog/dialog.js'

export default {
  name: 'AlertDialog',
  data: () => ({
    message: '',
    kind: 'success',
    visible: false,
    timer: null,
  }),
  methods: {
    show(msg, type = 'success', duration = 3000) {
      this.message = msg
      this.kind = type
      this.visible = true
      clearTimeout(this.timer)

      this.$refs.dlg?.show()
      this.timer = setTimeout(() => this.hide(), duration)
    },
    hide() {
      clearTimeout(this.timer)
      this.$refs.dlg?.close()
    },
  },
}
</script>

<style scoped>
.alert-dialog::part(scrim) {
  display: none !important;
}

.alert-dialog::part(container) {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0; /* override default centering gaps */
  border-radius: 16px;
  padding: 0; /* we style the inner .content */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  border: none;
  background: transparent; /* let .content provide bg */
}

/* Allow clicking through except on the pill itself */
.alert-dialog {
  pointer-events: none;
}
.alert-dialog::part(container) {
  pointer-events: auto;
}

/* Pill */
.content {
  color: #fff;
  padding: 12px 18px;
  border-radius: 16px;
  font-weight: 600;
  max-width: 85vw;
  text-align: left;
}

/* Kinds */
.content.success {
  background: #1e6d61;
} /* matches your mock */
.content.error {
  background: #b3261e;
}
.content.info {
  background: #3558a5;
}

.msg {
  white-space: pre-line;
}
</style>
