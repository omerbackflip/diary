import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "diaryList",
      component: () => import("./components/DiaryList")
    },
    {
      path: "/tableList",
      name: "table-list",
      component: () => import("./components/TableList")
    },
  ]
});