<template>
  <div class="calendar-page" :class="{ mobile: isMobileView }">
    <v-card class="elevation-3 hebrew">
      <v-toolbar flat class="calendar-toolbar">
        <v-row no-gutters class="w-100">
          <!-- title -->
          <v-col
            cols="12"
            md="3"
            class="d-flex justify-center justify-md-start align-center mb-2 mb-md-0"
          >
            <v-toolbar-title class="calendar-title">
              יומן פועלים
            </v-toolbar-title>
          </v-col>

          <!-- month navigation -->
          <v-col cols="6"
            md="5"
            class="d-flex justify-center align-center"
          >
            <v-btn icon small @click="prevMonth">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>

            <span class="calendar-month-title mx-2">
              {{ calendarTitle }}
            </span>

            <v-btn icon small @click="nextMonth">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-col>

          <!-- actions -->
          <v-col
            cols="6"
            md="4"
            class="d-flex justify-center justify-md-end align-center flex-wrap"
          >
            <v-btn
              small
              color="primary"
              class="mx-1"
              @click="goToCurrentMonth"
            >
              החודש הנוכחי
            </v-btn>

            <v-btn
              small
              outlined
              color="primary"
              class="mx-1"
              @click="showMonthListDialog = true"
            >
              רשימת חודש
            </v-btn>
          </v-col>
        </v-row>
      </v-toolbar>

      <v-divider />

      <div class="calendar-wrapper">
        <div class="calendar-scroll" :class="{ mobile: isMobileView }">
          <v-calendar
            ref="calendar"
            v-model="focus"
            type="month"
            locale="he-IL"
            :weekdays="[0,1,2,3,4,5,6]"
            class="diary-calendar"
          >
            <template v-slot:day="{ date, outside }">
              <div
                class="day-cell"
                :class="{ 'outside-day': outside }"
                @click="onClickDay(date)"
              >
                <div
                  v-if="getDiaryByDate(date)"
                  class="poalim-box"
                >
                  <div class="poalim-label">
                    פועלים
                  </div>
                  <div class="poalim-value">
                    {{ getDiaryByDate(date).poalim || 0 }}
                  </div>
                </div>
              </div>
            </template>
          </v-calendar>
        </div>
      </div>
    </v-card>

    <v-dialog
      v-model="showMonthListDialog"
      :max-width="isMobileView ? '98%' : 650"
      scrollable
    >
      <v-card class="hebrew">
        <v-card-title class="month-list-title">
          <span>רשימת ימים - {{ calendarTitle }}</span>
          <v-spacer />
          <v-btn icon @click="showMonthListDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="month-list-content">
          <v-list dense class="pa-0">
            <v-list-item
              v-for="day in monthDaysList"
              :key="day.date"
              class="month-day-row"
              @click="openDayFromList(day.date)"
            >
              <v-list-item-content>
                <v-list-item-title class="month-day-date">
                  {{ formatDisplayDate(day.date) }}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action class="month-day-poalim">
                <span class="month-day-poalim-label">פועלים:</span>
                <span class="month-day-poalim-value">{{ day.poalim }}</span>
              </v-list-item-action>
            </v-list-item>

            <v-divider />

            <v-list-item class="month-total-row">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  סה"כ לחודש
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <span class="month-total-value">{{ monthTotalPoalim }}</span>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <diary-form ref="diaryForm" />
  </div>
</template>

<script>
import moment from "moment";
import apiService from "../../services/apiService";
import diaryForm from "../Diary/DiaryForm.vue";
import {
  DIARY_MODEL,
  NEW_DIARY,
  loadTable,
  isMobile
} from "../../constants/constants";

export default {
  name: "DiaryCalendar",
  components: { diaryForm },

  data() {
    return {
      diaryList: [],
      months: [],
      month: new Date().getMonth() + 1,
      focus: moment().startOf("month").format("YYYY-MM-DD"),
      diary: {},
      isMobileView: isMobile(),
      onResizeHandler: null,
      showMonthListDialog: false
    };
  },

  computed: {
    filteredDiaryList() {
      return this.diaryList.filter(item => {
        return new Date(item.date).getMonth() + 1 === this.month;
      });
    },

    calendarTitle() {
      const monthObj = this.months.find(
        m => Number(m.id) === Number(this.month)
      );
      return monthObj ? monthObj.name : "";
    },

    currentYear() {
      return moment(this.focus).year();
    },

    monthDaysList() {
      const daysInMonth = moment(
        `${this.currentYear}-${String(this.month).padStart(2, "0")}-01`
      ).daysInMonth();

      const result = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = moment(
          `${this.currentYear}-${String(this.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        ).format("YYYY-MM-DD");

        const diary = this.getDiaryByDate(date);
        const poalim = diary ? Number(diary.poalim || 0) : 0;

        // ✅ filter: only include days with poalim > 0
        if (poalim > 0) {
          result.push({
            date,
            poalim
          });
        }
      }

      return result;
    },

    monthTotalPoalim() {
      return this.monthDaysList.reduce((sum, day) => {
        return sum + Number(day.poalim || 0);
      }, 0);
    }
  },

  methods: {
    async retrieveDairies() {
      const response = await apiService.clientGetEntities(DIARY_MODEL);

      if (response && response.data) {
        this.diaryList = response.data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
      }
    },

    normalizeDate(date) {
      return moment(date).format("YYYY-MM-DD");
    },

    formatDisplayDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },

    getDiaryByDate(date) {
      const normalized = this.normalizeDate(date);

      return this.filteredDiaryList.find(item => {
        return this.normalizeDate(item.date) === normalized;
      });
    },

    async onClickDay(date) {
      const existingDiary = this.getDiaryByDate(date);

      if (existingDiary && existingDiary._id) {
        this.diary = existingDiary;
        await this.$refs.diaryForm.open(this.diary, false);
      } else {
        this.diary = { ...NEW_DIARY };
        this.diary.date = moment(date).format("YYYY-MM-DD");
        await this.$refs.diaryForm.open(this.diary, true);
      }

      await this.retrieveDairies();
    },

    async openDayFromList(date) {
      this.showMonthListDialog = false;
      await this.onClickDay(date);
    },

    prevMonth() {
      if (this.month > 1) {
        this.month--;
      } else {
        this.month = 12;
      }

      this.syncFocusWithMonth();
    },

    nextMonth() {
      if (this.month < 12) {
        this.month++;
      } else {
        this.month = 1;
      }

      this.syncFocusWithMonth();
    },

    goToCurrentMonth() {
      this.month = new Date().getMonth() + 1;
      this.syncFocusWithMonth();
    },

    syncFocusWithMonth() {
      const year = moment(this.focus).year() || new Date().getFullYear();
      this.focus = moment(
        `${year}-${String(this.month).padStart(2, "0")}-01`
      ).format("YYYY-MM-DD");
    },

    updateMobileView() {
      this.isMobileView = isMobile();
    }
  },

  async mounted() {
    this.months = (await loadTable(3)).map(code => {
      return {
        id: code.table_code,
        name: code.description
      };
    });

    this.syncFocusWithMonth();
    await this.retrieveDairies();

    this.$root.$on("addNewDiary", async () => {
      this.diary = { ...NEW_DIARY };
      this.diary.date = moment(new Date()).format("YYYY-MM-DD");
      await this.$refs.diaryForm.open(this.diary, true);
      await this.retrieveDairies();
    });

    this.onResizeHandler = () => {
      this.updateMobileView();
    };

    window.addEventListener("resize", this.onResizeHandler);
  },

  beforeDestroy() {
    this.$root.$off("addNewDiary");
    window.removeEventListener("resize", this.onResizeHandler);
  }
};
</script>

<style scoped>
.calendar-page {
  max-width: 100%;
  margin: auto;
  padding: 8px;
}

.calendar-page.mobile {
  padding: 2px;
}

.calendar-wrapper {
  padding: 8px;
}

.calendar-page.mobile .calendar-wrapper {
  padding: 2px;
}

.calendar-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.calendar-scroll.mobile {
  overflow-x: hidden;
}

.hebrew {
  direction: rtl;
}

.calendar-toolbar {
  height: auto !important;
  padding: 8px 12px;
}

.calendar-title {
  text-align: center;
  color: blue;
  font-size: 22px;
  font-weight: 700;
}

.calendar-month-title {
  font-weight: 700;
  font-size: 18px;
  white-space: nowrap;
}

.diary-calendar {
  width: 100%;
}

.day-cell {
  min-height: 110px;
  height: 100%;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.day-cell:hover {
  background: #f5faff;
}

.outside-day {
  opacity: 0.35;
}

.poalim-box {
  margin-top: 6px;
  border-radius: 10px;
  background: #e3f2fd;
  padding: 8px 6px;
  text-align: center;
}

.poalim-label {
  font-size: 11px;
  color: #555;
  line-height: 1.2;
}

.poalim-value {
  font-size: 20px;
  font-weight: 700;
  color: #1565c0;
  line-height: 1.2;
}

.month-list-title {
  font-weight: 700;
}

.month-list-content {
  padding: 0 !important;
}

.month-day-row {
  cursor: pointer;
}

.month-day-row:hover {
  background: #f5faff;
}

.month-day-date {
  font-size: 14px;
}

.month-day-poalim {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: 110px;
  justify-content: flex-end;
}

.month-day-poalim-label {
  color: #666;
  font-size: 13px;
}

.month-day-poalim-value {
  font-weight: 700;
  color: #1565c0;
  font-size: 18px;
}

.month-total-row {
  background: #eef7ff;
}

.month-total-value {
  font-weight: 700;
  color: #0d47a1;
  font-size: 22px;
}

/* Tablet */
@media (max-width: 960px) {
  .calendar-page {
    padding: 4px;
  }

  .calendar-wrapper {
    padding: 4px;
  }

  .calendar-title {
    font-size: 20px;
  }

  .calendar-month-title {
    font-size: 16px;
  }

  .day-cell {
    min-height: 90px;
    padding: 4px;
  }

  .poalim-box {
    padding: 6px 4px;
    border-radius: 8px;
  }

  .poalim-value {
    font-size: 18px;
  }
}

/* Phone */

.calendar-page.mobile .calendar-title {
  font-size: 18px;
}

.calendar-page.mobile .calendar-month-title {
  font-size: 15px;
}

.calendar-page.mobile .day-cell {
  min-height: 58px;
  padding: 2px;
}

.calendar-page.mobile .poalim-box {
  margin-top: 2px;
  padding: 3px 2px;
  border-radius: 6px;
}

.calendar-page.mobile .poalim-label {
  font-size: 9px;
}

.calendar-page.mobile .poalim-value {
  font-size: 13px;
}

.calendar-page.mobile .month-day-date {
  font-size: 13px;
}

.calendar-page.mobile .month-day-poalim-label {
  font-size: 12px;
}

.calendar-page.mobile .month-day-poalim-value {
  font-size: 16px;
}

.calendar-page.mobile .month-total-value {
  font-size: 20px;
}

/* tighten Vuetify calendar internal spacing on mobile */
.calendar-page.mobile ::v-deep .v-calendar-monthly__day {
  min-height: 58px !important;
}

.calendar-page.mobile ::v-deep .v-calendar-weekly__day {
  min-width: 0 !important;
}

.calendar-page.mobile ::v-deep .v-calendar-monthly__day-label {
  margin-top: 2px !important;
  padding: 0 2px !important;
  font-size: 11px !important;
}

.calendar-page.mobile ::v-deep .v-calendar-monthly__week {
  min-height: 58px !important;
}

.calendar-page.mobile ::v-deep .v-calendar-daily_head-weekday {
  font-size: 10px !important;
  padding: 4px 0 !important;
}
</style>
