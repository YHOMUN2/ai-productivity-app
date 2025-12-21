import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../pages/Home.vue");
const AIAssistant = () => import("../pages/AIAssistant.vue");
const Note = () => import("../pages/Note.vue");
const Tools = () => import("../pages/Tools.vue");
const PDF = () => import("../pages/PDF.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/ai", component: AIAssistant },
    { path: "/note", component: Note },
    { path: "/tools", component: Tools },
    { path: "/pdf", component: PDF }
  ]
});

export default router;
