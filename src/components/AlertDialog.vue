<template>
  <transition name="fade">
    <div v-if="visible" class="alert-box" :class="kind" role="alert">
      <span class="msg">{{ message }}</span>
    </div>
  </transition>
</template>

<script>
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

      this.timer = setTimeout(() => this.hide(), duration)
    },
    hide() {
      clearTimeout(this.timer)
      this.visible = false
    },
  },
}
</script>

<style scoped>
/* container */
.alert-box {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  z-index: 9999;
  max-width: 90vw;
  pointer-events: none;
}

/* kinds */
.alert-box.success {
  background: #146d62;
}
.alert-box.error {
  background: #b3261e;
}
.alert-box.info {
  background: #3558a5;
}

/* text */
.msg {
  white-space: pre-line;
}

/* fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
