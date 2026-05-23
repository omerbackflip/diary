import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      name: "lead-list",
      component: () => import("./components/Leads/LeadList")
    },
    {
      path: "/diaryList",
      name: "diaryList",
      component: () => import("./components/Diary/DiaryList")
    },
    {
      path: "/leadCalendar",
      name: "lead-calendar",
      component: () => import("./components/Leads/LeadCalendar")
    },
    {
      path: "/holdersDash",
      name: "holders-dash",
      component: () => import("./components/Holders/HoldersDash")
    },
    {
      path: "/holderList",
      name: "holder-list",
      component: () => import("./components/Holders/HolderList")
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
      component: () => import("./components/ChangesPriceList.vue")
    },
    {
      path: "/pricelist-table",
      name: "pricelist-table",
      component: () => import("./components/PriceList/PriceListTable")
    },
    {
      path: "/diary-calendar",
      name: "diary-calendar",
      component: () => import("@/components/Diary/DiaryCalendar.vue")
    },
    {
      path: '/map-coordinate-picker',
      name: 'MapCoordinatePicker',
      component: () =>
        import('@/components/PriceList/MapCoordinatePicker.vue'),
    }
  ]
});