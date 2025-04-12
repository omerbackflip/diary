<template>
    <div>
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
        </div>
  
        <v-sheet height="750">
            <v-calendar
            ref="calendar"
            v-model="value"
            :weekdays="weekday"
            :type="type"
            :events="events"
            @click:event="getLeadForEdit"
            @click:more="getMore"
            />
        </v-sheet>

        <v-dialog v-model="showDialog" max-width="600px" persistent>
            <v-card>
                <v-card-title>Events for {{ selectedDate }}</v-card-title>
                <v-card-text>
                <v-list>
                    <v-list-item v-for="event in selectedEvents" :key="event.id" @click="getLeadForEdit({ event })">
                    <v-list-item-content>
                        <v-list-item-title>{{ event.name }}</v-list-item-title>
                    </v-list-item-content>
                    </v-list-item>
                </v-list>
                </v-card-text>
                <v-card-actions>
                <v-spacer />
                <v-btn text @click="showDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <lead-form ref="leadForm" />

    </div>
  </template>
  
<script>
import apiService from "../services/apiService";
import { LEAD_MODEL } from "../constants/constants";
import moment from "moment";
import leadForm from "./LeadForm.vue"

export default {
	name: "lead-calendar",
    components: { leadForm },
    data() {
        return {
            type: 'month', // 'month', 'week', 'day', '4day'
            weekday: [0, 1, 2, 3, 4, 5, 6],
            value: new Date().toISOString().substr(0, 10),
            events: [],
            leadsList: [],
            showDialog: false,
            selectedDate: null,
            selectedEvents: []
        }
    },

    methods: {
        async getEvents () {
            let response = await apiService.getMany({model: LEAD_MODEL})
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
                            name: item.name + ":" + item.trackRemark,
                            start: moment(item.trackDate).format('YYYY-MM-DD'),
                            color: 'blue',
                            timed: true,
                        })
                    }
                }); 
            }
        },

        // get lead data before call to leadForm for edit
        async getLeadForEdit(item) {
            if (item.event._id) {
                await this.$refs.leadForm.open(this.leadsList.find(lead => lead._id === item.event._id) , false);
            }
        },

        getMore({ date }) {
            const clickedDate = new Date(date).toISOString().split('T')[0];
            const moreEvents = this.events.filter(event => {
                const eventDate = new Date(event.start).toISOString().split('T')[0];
                return eventDate === clickedDate;
            });

            this.selectedEvents = moreEvents;
            this.selectedDate = clickedDate;
            
            this.$nextTick(() => { // Give Vuetify a moment to settle the DOM
                this.showDialog = true;
            });
        }
    },

    async mounted() {
        await this.getEvents(); // fetch events only once
    },

    computed: {
        currentMonth() {
            const date = new Date(this.value);
            return date.toLocaleDateString('default', {
                month: 'long',
                year: 'numeric'
            });
        }
    }
}
</script>

<style>
.v-event, .v-event-more {
    place-self: center;
}
</style>
  