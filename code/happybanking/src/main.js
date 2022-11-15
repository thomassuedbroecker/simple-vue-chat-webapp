import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "axios";
import assistantv1 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';


import "./assets/main.css";

const app = createApp(App);

app.use(router);

app.mount("#app");
