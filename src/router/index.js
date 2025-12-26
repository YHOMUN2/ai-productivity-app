import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../pages/Home.vue");
const Login = () => import("../pages/login.vue");
const Register = () => import("../pages/Register.vue");
const AIAssistant = () => import("../pages/AIAssistant.vue");
const Note = () => import("../pages/Note.vue");
const Tools = () => import("../pages/Tools.vue");
const PDF = () => import("../pages/PDF.vue");
const UICardDemo = () => import("../pages/UICardDemo.vue");
const StandardFormDemo = () => import("../pages/StandardFormDemo.vue");
const JsonFormatterPage = () => import("../pages/JsonFormatterPage.vue");
const Profile = () => import("../pages/Profile.vue");
const ChangeAvatar = () => import("../pages/ChangeAvatar.vue");
const AvatarSyncDemo = () => import("../pages/AvatarSyncDemo.vue");
const Settings = () => import("../pages/Settings.vue");
const RegexTesterPage = () => import("../pages/RegexTesterPage.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/ai-assistant", component: AIAssistant },
    { path: "/notes", component: Note },
    { path: "/tools", component: Tools },
    { path: "/pdf", component: PDF },
    { path: "/profile", component: Profile },
    { path: "/change-avatar", component: ChangeAvatar },
    { path: "/settings", component: Settings },
    { path: "/demo/avatar-sync", component: AvatarSyncDemo },
    { path: "/demo/uicard", component: UICardDemo },
    { path: "/demo/standard-form", component: StandardFormDemo },
    { path: "/demo/json-formatter", component: JsonFormatterPage },
    { path: "/demo/regex-tester", component: RegexTesterPage },
    // 捕获所有未匹配的路由，防止第三方脚本导致的导航错误
    { path: "/:pathMatch(.*)*", redirect: "/" }
  ]
});

// 路由错误处理：忽略来自浏览器插件或第三方脚本的导航错误
router.afterEach(() => {
  // 清除控制台中的第三方脚本警告
  if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // 过滤掉来自浏览器插件的路由警告（如 hybridaction、zybTracker）
      if (args[0]?.includes?.('/hybridaction') || args[0]?.includes?.('zybTracker')) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
});

export default router;
