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
      path: "/holdersDash",
      name: "holders-dash",
      component: () => import("./components/HoldersDash")
    },
    {
      path: "/holderList",
      name: "holder-list",
      component: () => import("./components/HolderList")
    },
    {
      path: "/globaldocform",
      name: "global-docForm",
      component: () => import("./components/GlobalDocForm")
    },
    {
      path: "/tableList",
      name: "table-list",
      component: () => import("./components/TableList")
    },
    {
      path: "/pricelist",
      name: "price-list",
      component: () => import("./components/PriceList")
    },
    {
      path: "/billform",
      name: "bill-form",
      component: () => import("./components/BillForm")
    },
  ]
});