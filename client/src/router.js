import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      name: "diaryList",
      component: () => import("./components/DiaryList")
    },
    {
      path: "/leadList",
      name: "lead-list",
      component: () => import("./components/LeadList")
    },
    {
      path: "/holderList",
      name: "holder-list",
      component: () => import("./components/HolderList")
    },
    {
      path: "/holderList1",
      name: "holder-list1",
      component: () => import("./components/HolderList1")
    },
    {
      path: "/tableList",
      name: "table-list",
      component: () => import("./components/TableList")
    },
  ]
});