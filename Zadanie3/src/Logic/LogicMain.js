
import { ref, nextTick } from "vue";

import {
    DELETE,
    GET,
    GET_ONE,
    PATCH1,
    PATCH2,
    POST,
    PUT,
    RESET
} from "@/Logic/RestApi.js";

export function LogicMain(StudentOut, UPDATE_CALENDAR) {

    const error1 = ref("");
    const error2 = ref("");
    const loading = ref(false);

    const StudentOut_ONE = ref(null);
    const GET_ONE_ID_VARIABLE = ref(null);

    const TodoCreate = ref({
        title: "",
        description: "",
        date_from: "",
        date_to: "",
        is_finished: false,
    });

    const TodoRECreate = ref({
        title: "",
        description: "",
        date_from: "",
        date_to: "",
        is_finished: false,
    });

    const zobrazitUpravu = ref(false);

    async function UPLOAUD_REDACO() {
        if (new Date(TodoCreate.value.date_from) >= new Date(TodoCreate.value.date_to)) {
            alert("Čas začiatku musí byť pred časom ukončenia!");
            return;
        }
        loading.value = true;
        try {
            await POST(StudentOut.value.name, TodoCreate.value);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        } catch (err) {
            console.log(err.message);
        }
        finally {
            loading.value = false;
        }
    }

    async function reset() {
        const potvrdenie = confirm("Naozaj chceš resetovať úlohy?");
        if (!potvrdenie) {
            return;
        }
        loading.value = true;
        try {
            await RESET(StudentOut.value.name);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        } catch (err) {
            console.log(err.message);
        }
        finally {
            loading.value = false;
        }
    }

    async function GET_ONLY_ONE() {
        loading.value = true;
        error1.value = "";
        StudentOut_ONE.value = null;

        try {
            StudentOut_ONE.value = await GET_ONE(StudentOut.value.name, GET_ONE_ID_VARIABLE.value);
        }
        catch(err) {
            error1.value = err.message;
        }
        finally {
            loading.value = false;
        }
    }

    function SHAPESHIFT(uloha) {
        TodoRECreate.value = {
            title: uloha.title,
            description: uloha.description,
            date_from: uloha.date_from.slice(0, 16),
            date_to: uloha.date_to.slice(0, 16),
            is_finished: uloha.is_finished
        };
        GET_ONE_ID_VARIABLE.value = uloha.id;
    }

    async function SCROLL() {
        zobrazitUpravu.value = true;

        await nextTick();

        document.getElementById("edit").scrollIntoView({
            behavior: "smooth"
        });
    }

    async function EDIT(){
        if (new Date(TodoRECreate.value.date_from) >= new Date(TodoRECreate.value.date_to)) {
            alert("Čas začiatku musí byť pred časom ukončenia!");
            return;
        }
        loading.value = true;
        error2.value = "";
        try {
            await PUT(StudentOut.value.name, GET_ONE_ID_VARIABLE.value, TodoRECreate.value);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        }
        catch(err) {
            error2.value = err.message;
        }
        finally {
            loading.value = false;
        }
    }

    async function Delete(id){
        const potvrdenie = confirm("Naozaj chceš vymazat úlohu?");
        if (!potvrdenie) {
            return;
        }
        loading.value = true;
        error2.value = "";
        try {
            await DELETE(StudentOut.value.name, id.id);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        }
        catch(err) {
            error2.value = err.message;
        }
        finally {
            loading.value = false;
        }
    }

    async function DONE(uloha){
        loading.value = true;
        error2.value = "";
        try {
            await PATCH1(StudentOut.value.name, uloha.id);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        }
        catch(err) {
            error2.value = err.message;
        }
        finally {
            loading.value = false;
        }
    }

    async function UNDONE(uloha){
        loading.value = true;
        error2.value = "";
        try {
            await PATCH2(StudentOut.value.name, uloha.id);
            StudentOut.value = await GET(StudentOut.value.name);
            UPDATE_CALENDAR()
        }
        catch(err) {
            error2.value = err.message;
        }
        finally {
            loading.value = false;
        }
    }

    return {
        error1,
        error2,
        loading,
        StudentOut_ONE,
        GET_ONE_ID_VARIABLE,
        TodoCreate,
        TodoRECreate,
        zobrazitUpravu,
        UPLOAUD_REDACO,
        reset,
        GET_ONLY_ONE,
        SHAPESHIFT,
        SCROLL,
        EDIT,
        Delete,
        DONE,
        UNDONE
    };
}
