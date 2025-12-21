import { createApp } from "vue";
import App from "./AppLayout.vue";
import router from "./router";
import pinia from "./stores";

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount("#app");

import "./assets/theme.css";
