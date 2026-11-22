import { reactive } from "vue";

import themePlugin from "@fullcalendar/vue3/themes/forma";
import dayGridPlugin from "@fullcalendar/vue3/daygrid";
import interactionPlugin from "@fullcalendar/vue3/interaction";
import timeGridPlugin from "@fullcalendar/vue3/timegrid";

export function Calendar(TodoCreate, GET_ONE_ID_VARIABLE, GET_ONLY_ONE, formatDate) {

    const calendarOptions = reactive({
        plugins: [themePlugin, dayGridPlugin, interactionPlugin, timeGridPlugin],
        initialView: "dayGridMonth",
        selectable: true,

        headerToolbar: {
            left: "prev next today",
            center: "title",
            right: "timeGridDay timeGridWeek dayGridMonth"
        },

        events: [],

        select(info) {
            TodoCreate.value.date_from = formatDate(info.start);
            TodoCreate.value.date_to = formatDate(info.end);
        },

        eventClick(info) {
            GET_ONE_ID_VARIABLE.value = info.event.id;
            GET_ONLY_ONE();
        }
    });

    function UPDATE_CALENDAR(StudentOut) {
        calendarOptions.events = StudentOut.value.todos.map(uloha => ({
            id: uloha.id,
            title: uloha.title,
            start: uloha.date_from,
            end: uloha.date_to,
            color: uloha.is_finished ? "green" : "blue"
        }));
    }

    return {
        calendarOptions,
        UPDATE_CALENDAR
    };
}