<template>
    <div class="lead-calendar-page">
        <div class="d-flex justify-center">
        <v-sheet tile height="54" class="d-flex align-center px-2" style="max-width: 300px; width: 100%;">
            <v-btn icon class="ma-2" @click="$refs.calendar.prev()">
            <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div class="text-h6 flex-grow-1 text-center">{{ currentMonth }}</div>
            <v-btn icon class="ma-2" @click="$refs.calendar.next()">
            <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
        </v-sheet>
        <v-text-field
            v-model="search"
            label="חיפוש פגישה"
            clearable
            dense
            hide-details
            style="max-width: 300px; width: 100%; margin-top: 12px;"
        />
        </div>
  
        <v-sheet style="height: 85vh">
        <v-calendar
            ref="calendar"
            v-model="value"
            :weekdays="weekday"
            :type="type"
            :events="filteredEvents"
            locale="he-IL"
            @change="onCalendarChange"
            @click:date="openNewReminder"
            @click:event="getEventForEdit"
            @click:more="getMore"
        >
            <template v-slot:day="{ date }">
                <div
                    v-if="getDayMarker(date)"
                    class="calendar-day-marker"
                    :class="getDayMarker(date).className"
                >
                    <span>{{ getDayMarker(date).label }}</span>
                </div>
            </template>
        </v-calendar>
        </v-sheet>

        <v-dialog v-model="getMoreDialog" max-width="600px" persistent>
            <v-card>
                <v-card-title>Events for {{ selectedDate }}
                    <v-spacer />
                    <v-btn text @click="getMoreDialog = false">Close</v-btn>
                </v-card-title>
                <v-card-text>
                <v-list>
                    <v-list-item v-for="event in selectedEvents" :key="event._id" @click="getEventForEdit({ event })">
                    <v-list-item-content>
                        <v-list-item-title :class="{ 'eli-event': event.description && event.description.startsWith('אלי:') }">{{ event.name }}</v-list-item-title>
                    </v-list-item-content>
                    </v-list-item>
                </v-list>
                </v-card-text>
                <v-card-actions>
                <v-spacer />
                <v-btn text @click="getMoreDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="reminderDialog" max-width="500px" persistent>
            <v-card style="direction: rtl;">
                <v-card-title>{{ reminder._id ? 'עריכת תזכורת' : 'תזכורת חדשה' }}</v-card-title>
                <v-card-text>
                    <v-form ref="reminderForm" @submit.prevent="saveReminder">
                        <v-text-field
                            v-model="reminder.description"
                            label="תזכורת"
                            autofocus
                            required
                            :rules="[value => !!(value && value.trim()) || 'יש להזין תזכורת']"
                            @keyup.enter="saveReminder"
                        />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        v-if="reminder._id"
                        text
                        color="red"
                        :disabled="savingReminder"
                        @click="deleteReminder"
                    >מחק</v-btn>
                    <v-spacer />
                    <v-btn text :disabled="savingReminder" @click="closeReminderDialog">ביטול</v-btn>
                    <v-btn color="primary" :loading="savingReminder" @click="saveReminder">שמור</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <lead-form ref="leadForm" />

    </div>
  </template>
  
<script>
import apiService from "../../services/apiService";
import { LEAD_MODEL, TABLE_MODEL, TABLE_IDS } from "../../constants/constants";
import moment from "moment";
import leadForm from "../Leads/LeadForm.vue"
import israeliCalendarConfig from "../../config/israeliCalendarConfig";
import { dateKeyInTimeZone, getIsraeliHolidays, weekdayForDate } from "../../services/israeliHolidays";

export default {
	name: "lead-calendar",
    components: { leadForm },
    data() {
        return {
            type: 'month', // 'month', 'week', 'day', '4day'
            weekday: [0, 1, 2, 3, 4, 5, 6],
            value: dateKeyInTimeZone(new Date(), israeliCalendarConfig.timezone),
            events: [],
            holidayEvents: [],
            loadedHolidayYears: {},
            leadsList: [],
            remindersList: [],
            getMoreDialog: false,
            selectedDate: null,
            selectedEvents: [],
            search: "",   // הוספנו state לחיפוש
            reminderDialog: false,
            savingReminder: false,
            reminder: {
                _id: null,
                date: '',
                description: ''
            }
        }
    },

    methods: {
        async loadHolidayYear(year) {
            const numericYear = Number(year);
            if (!numericYear || this.loadedHolidayYears[numericYear]) return;
            this.$set(this.loadedHolidayYears, numericYear, true);
            const holidays = await getIsraeliHolidays(numericYear, israeliCalendarConfig);
            const existingIds = new Set(this.holidayEvents.map(event => event._id));
            this.holidayEvents = this.holidayEvents.concat(
                holidays.filter(event => !existingIds.has(event._id))
            );
        },

        async onCalendarChange({ start, end }) {
            if (start && start.year) await this.loadHolidayYear(start.year);
            if (end && end.year && (!start || end.year !== start.year)) {
                await this.loadHolidayYear(end.year);
            }
        },

        getDayMarker(date) {
            const weekday = weekdayForDate(date);
            if (weekday === 6) return { label: 'שבת', className: 'shabbat-day' };
            if (weekday === 5 && israeliCalendarConfig.fridayMode === 'short') {
                return { label: 'יום קצר', className: 'friday-short-day' };
            }
            if (weekday === 5 && israeliCalendarConfig.fridayMode === 'day-off') {
                return { label: 'יום חופש', className: 'friday-day-off' };
            }
            return null;
        },

        async getEvents () {
            this.events = [];
            let response;
            let role = localStorage.getItem('DiaryAuthenticated'); // 'admin' or 'viewer'
            if (role === 'viewer') {
                response = await apiService.clientGetEntities(LEAD_MODEL, { arrivedFrom: 'יד1' });
            } else {
                response = await apiService.clientGetEntities(LEAD_MODEL);
            }
            if (response && response.data) {
                this.leadsList = response.data.sort(function (a, b) {
                    const updatedAtA = new Date(a.updatedAt);
                    const updatedAtB = new Date(b.updatedAt);
                    return updatedAtB - updatedAtA;
                });
                this.leadsList.forEach(item => {
                    if (item.trackDate) {
                        this.events.push({
                            _id: item._id,
                            type: 'lead',
                            name: item.name + ":" + item.trackRemark,
                            description: item.description,
                            start: moment(item.trackDate).format('YYYY-MM-DD'),
                            color: item.description && item.description.startsWith('אלי:') ? 'green' : 'blue',
                            timed: true,
                        })
                    }
                }); 
            }

            const remindersResponse = await apiService.clientGetEntities(TABLE_MODEL, {
                table_id: TABLE_IDS.REMINDERS
            });
            if (remindersResponse && remindersResponse.data) {
                this.remindersList = remindersResponse.data;
                this.remindersList.forEach(item => {
                    const date = this.tableCodeToDate(item.table_code);
                    if (date) {
                        this.events.push({
                            _id: item._id,
                            type: 'reminder',
                            name: item.description,
                            start: date,
                            color: 'grey',
                            timed: false
                        });
                    }
                });
            }
        },

        async getEventForEdit({ event }) {
            this.getMoreDialog = false;
            if (event.source === 'hebcal') return;
            if (event.type === 'reminder') {
                const item = this.remindersList.find(reminder => reminder._id === event._id);
                if (item) {
                    this.reminder = {
                        _id: item._id,
                        date: this.tableCodeToDate(item.table_code),
                        description: item.description || ''
                    };
                    this.reminderDialog = true;
                }
                return;
            }

            if (event._id) {
                await this.$refs.leadForm.open(this.leadsList.find(lead => lead._id === event._id), false);
            }
        },

        openNewReminder({ date }) {
            this.reminder = {
                _id: null,
                date,
                description: ''
            };
            this.reminderDialog = true;
            this.$nextTick(() => {
                if (this.$refs.reminderForm) this.$refs.reminderForm.resetValidation();
            });
        },

        closeReminderDialog() {
            this.reminderDialog = false;
        },

        async saveReminder() {
            if (this.savingReminder || !this.reminder.description || !this.reminder.description.trim()) return;

            this.savingReminder = true;
            try {
                const data = {
                    table_id: TABLE_IDS.REMINDERS,
                    table_code: this.dateToTableCode(this.reminder.date),
                    description: this.reminder.description.trim()
                };

                if (this.reminder._id) {
                    await apiService.updateEntity(
                        { _id: this.reminder._id },
                        data,
                        { model: TABLE_MODEL }
                    );
                } else {
                    await apiService.create(data, { model: TABLE_MODEL });
                }

                this.reminderDialog = false;
                await this.getEvents();
            } finally {
                this.savingReminder = false;
            }
        },

        async deleteReminder() {
            if (this.savingReminder || !this.reminder._id) return;

            this.savingReminder = true;
            try {
                await apiService.deleteOne({ model: TABLE_MODEL, id: this.reminder._id });
                this.reminderDialog = false;
                await this.getEvents();
            } finally {
                this.savingReminder = false;
            }
        },

        dateToTableCode(date) {
            return Number(date.replace(/-/g, ''));
        },

        tableCodeToDate(tableCode) {
            const value = String(tableCode || '');
            if (!/^\d{8}$/.test(value)) return null;
            return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
        },

        getMore({ date }) {
            const clickedDate = date;
            const moreEvents = this.calendarEvents.filter(event => {
                return event.start === clickedDate;
            });

            this.selectedEvents = moreEvents;
            this.selectedDate = clickedDate;
            
            this.$nextTick(() => { // Give Vuetify a moment to settle the DOM
                this.getMoreDialog = true;
            });
        }
    },

    async mounted() {
        await Promise.all([
            this.getEvents(),
            this.loadHolidayYear(Number(this.value.slice(0, 4)))
        ]);
    },

    watch: {
        value(newValue, oldValue) {
            const year = Number(String(newValue || '').slice(0, 4));
            const oldYear = Number(String(oldValue || '').slice(0, 4));
            if (year && year !== oldYear) this.loadHolidayYear(year);
        }
    },

    computed: {
        currentMonth() {
            return moment(this.value, 'YYYY-MM-DD').locale('he').format('MMMM YYYY');
        },
        calendarEvents() {
            const seen = new Set();
            return this.events.concat(this.holidayEvents).filter(event => {
                const key = event._id || `${event.type}:${event.start}:${event.name}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        },
        // אירועים מסוננים לפי החיפוש
        filteredEvents() {
            const regularEvents = !this.search ? this.events : this.events.filter(ev =>
                ev.name.toLowerCase().includes(this.search.toLowerCase())
            );
            return regularEvents.concat(this.holidayEvents);
        }
    }
}
</script>

<style>
.v-event, .v-event-more {
    place-self: center;
}

.eli-event {
    background-color: #dff0d8;
}

.v-calendar-monthly__day.v-present,
.v-calendar-weekly__day.v-present {
    background-color: #dff0ff !important;
    box-shadow: inset 0 0 0 3px #1976d2;
}

.lead-calendar-page .v-calendar-monthly__day,
.lead-calendar-page .v-calendar-weekly__day {
    position: relative;
}

.calendar-day-marker {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 5px;
    pointer-events: none;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    z-index: 0;
}

.calendar-day-marker span {
    position: relative;
    z-index: 1;
}

.shabbat-day { background-color: #e3f2fd; color: #0d47a1; }
.friday-short-day { background-color: #fff8e1; color: #e65100; }
.friday-day-off { background-color: #ffebee; color: #b71c1c; }

.lead-calendar-page .v-event,
.lead-calendar-page .v-event-more,
.lead-calendar-page .v-calendar-monthly__day-label {
    position: relative;
    z-index: 2;
}
</style>
