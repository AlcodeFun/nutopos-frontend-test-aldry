import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/select/outlined-select.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/filled-icon-button.js'
import '@material/web/iconbutton/outlined-icon-button.js'
import '@material/web/checkbox/checkbox.js'
import '@material/data-table/dist/mdc.data-table.css'
import '@material/checkbox/dist/mdc.checkbox.css'
import '@material/icon-button/dist/mdc.icon-button.css'
import '@material/web/dialog/dialog.js'
import '@material/web/textfield/filled-text-field.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/filled-icon-button.js'
import '@material/web/iconbutton/filled-tonal-icon-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/iconbutton/outlined-icon-button.js'

const app = createApp(App)

app.use(router)

app.mount('#app')
