<script setup>
import {ref, onMounted, reactive, computed, nextTick} from "vue";
import {DELETE, GET, GET_ONE, Health, PATCH1, PATCH2, POST, PUT, RESET} from "@/Logika.js";
import FullCalendar from "@fullcalendar/vue3";
import themePlugin from "@fullcalendar/vue3/themes/forma"; // YOUR THEME
import dayGridPlugin from "@fullcalendar/vue3/daygrid";
import interactionPlugin from "@fullcalendar/vue3/interaction";
import timeGridPlugin from "@fullcalendar/vue3/timegrid";
import '@fullcalendar/vue3/skeleton.css'; // ALWAYS NEED SKELETON
import '@fullcalendar/vue3/themes/forma/theme.css'; // YOUR THEME
import '@fullcalendar/vue3/themes/forma/palettes/purple.css'; // YOUR THEME'S PALETTE
import Header from "@/Header.vue";
import Footer from "@/Footer.vue";


const data = ref("");
const error = ref("");
const error1 = ref("");
const error2 = ref("");
const loading = ref(false);
const calendarRef = ref(null);
const filterUloh = ref("vsetky");
const zoradenieZoznamu = ref("datum");
const hladanyNazov = ref("");
const zobrazitUpravu = ref(false);


const HTTPValidationError = ref("");
const StudentOut = ref(null);
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
const TodoOut = ref(null);
const ValidationError = ref (null);

const calendarOptions = reactive({
  plugins: [themePlugin, dayGridPlugin, interactionPlugin, timeGridPlugin],
  initialView: "dayGridMonth",
  selectable: true,
  headerToolbar: {
    left: 'prev next today',
    center: 'title',
    right: 'timeGridDay timeGridWeek dayGridMonth'
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
const zobrazeneUlohy = computed(() => {
  let uloha = [...StudentOut.value.todos];

  // Filter
  if (filterUloh.value === "dokoncene") {
    uloha = uloha.filter(u => u.is_finished);
  }
  else if (filterUloh.value === "nedokoncene") {
    uloha = uloha.filter(u => !u.is_finished);
  }
  uloha = uloha.filter(u =>
      u.title.toLowerCase().includes(hladanyNazov.value.toLowerCase())
  );

  // Zoradenie
  uloha.sort((a, b) =>
      zoradenieZoznamu.value === "datum"
          ? new Date(a.date_from) - new Date(b.date_from)
          : a.title.localeCompare(b.title, "sk")
  );

  return uloha;
});
function formatDate(date) {
  const pad = n => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTime(iso) {
  return new Date(new Date(iso).getTime() - 3600000).toLocaleString("sk-SK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
});
}
function UPDATE_CALENDAR() {
  calendarOptions.events = StudentOut.value.todos.map(uloha => ({
    id: uloha.id,
    title: uloha.title,
    start: uloha.date_from,
    end: uloha.date_to,
    color: uloha.is_finished ? "green" : "#3788d8"
  }));
}

function DEBUG() {
  console.log(JSON.stringify(TodoCreate.value));
}
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
    loading.value = false;}
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
    loading.value = false;}
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
async function POSUN_NA_UPRAVENIE() {
  zobrazitUpravu.value = true;

  await nextTick();

  document.getElementById("edit").scrollIntoView({
    behavior: "smooth"
  });
}
async function EDIT(){
  if (new Date(TodoCreate.value.date_from) >= new Date(TodoCreate.value.date_to)) {
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


onMounted(async () => {
  loading.value = true;

  try {
    data.value = await Health();
    StudentOut.value = await GET("xpupava");
    UPDATE_CALENDAR()
    console.log("response servera je:", data.value.status, "takze sa ide");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
    console.log("StudentOut:", StudentOut.value);
  }
});


</script>

<template>
  <Header />
  <p v-if="loading">Načítavam dáta zo servera...</p>
  <p v-else-if="error">
    Nastala chyba: {{ error }}, Správne fungovanie Stránky nie je možné
  </p>
  <p v-else>
    Dostal som od servera: {{ data.status }}
  </p>

  <h1 id="Ulohy" class="text-center"> Zoznam</h1>

  <section v-if="StudentOut" class="container py-4">

    <div class="row g-3 mb-4">

      <div class="col-md-6">
        <label class="form-label fw-semibold">Filtrovať úlohy</label>
        <select v-model="filterUloh" class="form-select rounded-3">
          <option value="vsetky">Všetky</option>
          <option value="dokoncene">Dokončené</option>
          <option value="nedokoncene">Nedokončené</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-semibold">Zoradiť podľa</label>
        <select v-model="zoradenieZoznamu" class="form-select rounded-3">
          <option value="datum">Podľa dátumu</option>
          <option value="nazov">Podľa názvu</option>
        </select>
      </div>

    </div>
    <input
        type="text"
        v-model="hladanyNazov"
        placeholder="Vyhľadať úlohu podľa názvu..."
        class="form-control mb-3"
    />

    <div v-if="zobrazeneUlohy.length === 0" class="text-center py-5">
      <h4 v-if="filterUloh === 'dokoncene'">
        Nemáš žiadne dokončené úlohy.
      </h4>

      <h4 v-else-if="filterUloh === 'nedokoncene'">
        Nemáš žiadne nedokončené úlohy.
      </h4>

      <h4 v-else>
        Zatiaľ nemáš žiadne úlohy.
      </h4>
    </div>

    <!-- Zoznam úloh -->
    <div v-else class="row g-3">

      <div
          v-for="uloha in zobrazeneUlohy"
          :key="uloha.id"
          class="col-12 col-md-6"
      >

        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">

            <h5 class="fw-bold mb-3">
              {{ uloha.title }}
            </h5>

            <p class="card-text text-secondary">
              ID: {{ uloha.id }}
            </p>
            <label class="form-label fw-semibold">Popis úlohy</label>
            <p class="card-text">
              {{ uloha.description }}
            </p>

            <hr>
            <label class="form-label fw-semibold">Čas od kedy do kedy:</label>
            <p class="mb-2">
              {{ formatTime(uloha.date_from) }}
            </p>

            <p class="mb-0">
              {{ formatTime(uloha.date_to) }}
            </p><br>

            <label class="form-label fw-semibold">Stav:</label>
            <p v-if="uloha.is_finished" class="text-success">
              Ukončená
            </p>

            <p v-else class="text-primary">
              Aktívna
            </p>
            <button class="btn btn-primary px-4 rounded-3 form-control" type="button" @click="SHAPESHIFT(uloha); POSUN_NA_UPRAVENIE()">
              Upraviť
            </button>

            <button class="btn btn-danger px-4 rounded-3 form-control" type="button" @click="Delete(uloha)">
              !!! Vymazat !!!
            </button>

            <button
                v-if="uloha.is_finished"
                class="btn btn-primary px-4 rounded-3 form-control"
                type="button"
                @click="UNDONE(uloha)"
            >
              Odoznacit
            </button>

            <button
                v-else
                class="btn btn-primary px-4 rounded-3 form-control"
                type="button"
                @click="DONE(uloha)"
            >
              Vybavene
            </button>

          </div>
        </div>

      </div>
    </div>

  </section>
  <div class="card shadow-sm border-0 rounded-4 my-4">
    <div class="card-body p-4">
      <h4 class="fw-bold mb-4">Vytvoriť novú úlohu</h4>
      <form @submit.prevent="UPLOAUD_REDACO">
        <div class="mb-3">
          <label class="form-label fw-semibold">Názov úlohy</label>
          <input
              v-model="TodoCreate.title"
              maxlength="200"
              placeholder="Zadaj názov úlohy"
              class="form-control"
              required
          >
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Popis úlohy</label>
          <textarea
              v-model="TodoCreate.description"
              maxlength="1000"
              placeholder="Opíš svoju úlohu..."
              class="form-control"
              rows="3"
          ></textarea>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Začiatok úlohy</label>
            <input
                v-model="TodoCreate.date_from"
                type="datetime-local"
                class="form-control"
                required
            >
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Koniec úlohy</label>
            <input
                v-model="TodoCreate.date_to"
                type="datetime-local"
                class="form-control"
                required
            >
          </div>
        </div>
        <button
            type="submit"
            class="btn btn-primary px-4 rounded-3"
            :disabled="loading"
        >
          {{ loading ? 'Vytváram...' : '+ Vytvoriť úlohu' }}
        </button>
      </form>
    </div>
  </div>


  <div class="card shadow-sm border-0 rounded-4 my-4">
    <div class="card-body p-4">
      <h4 class="fw-bold mb-4">Načíťať Jednu Úlohu Pomocou ID</h4>
  <form @submit.prevent="GET_ONLY_ONE">
    <input class="form-label fw-semibold form-control"  v-model="GET_ONE_ID_VARIABLE" maxlength="200" placeholder="ID úlohy" type="number" required>
    <button
        type="submit"
        class="btn btn-primary px-4 rounded-3"
        :disabled="loading"
    >
      {{ loading ? 'Načítavam' : 'Načíťať' }}
    </button>
  </form>
    </div></div>
  <p v-if="loading">Načítavam dáta zo servera...</p>
  <p v-else-if="error">
    Nejde no kukaj prečo: {{ error }}
  </p>
  <section v-if="error1" class="container py-4">
    <p>{{ error1 }}</p>
  </section>
  <section v-else-if="StudentOut_ONE" class="container py-4">
    <p>{{ StudentOut_ONE.title }}</p>
    <p>{{ StudentOut_ONE.description}}</p>
    <p>{{ formatTime(StudentOut_ONE.date_from) }}</p>
    <p>{{ formatTime(StudentOut_ONE.date_to) }}</p>
    <p>{{ formatTime(StudentOut_ONE.created_at) }}</p>
  </section>
  <section v-if="zobrazitUpravu" id="upravit-formular">
    <div class="card shadow-sm border-0 rounded-4 my-4">
      <div class="card-body p-4">
        <h4 class="fw-bold mb-4">Upraviť úlohu</h4>

        <form id="edit" @submit.prevent="EDIT">
          <div class="mb-3">
            <label class="form-label fw-semibold">Názov úlohy</label>
            <input
                v-model="TodoRECreate.title"
                maxlength="200"
                placeholder="Zadaj názov úlohy"
                class="form-control"
                required
            >
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Popis úlohy</label>
            <textarea
                v-model="TodoRECreate.description"
                maxlength="1000"
                placeholder="Opíš svoju úlohu..."
                class="form-control"
                rows="3"
            ></textarea>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Začiatok úlohy</label>
              <input
                  v-model="TodoRECreate.date_from"
                  type="datetime-local"
                  class="form-control"
                  required
              >
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Koniec úlohy</label>
              <input
                  v-model="TodoRECreate.date_to"
                  type="datetime-local"
                  class="form-control"
                  required
              >
            </div>
          </div>

          <button
              type="submit"
              class="btn btn-primary px-4 rounded-3 me-2"
              :disabled="loading"
          >
            {{ loading ? 'Upravujem...' : 'Uložiť zmeny' }}
          </button>

          <button
              type="button"
              class="btn btn-outline-secondary px-4 rounded-3"
              @click="zobrazitUpravu = false"
          >
            Zrušiť
          </button>
        </form>
      </div>
    </div>
  </section>
  <section v-if="error2" class="container py-4">
    <p>{{ error2 }}</p> </section>
  <h1 id="Kalendar" class="text-center"> Kalendar</h1>
  <section>  <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
  /> </section>

  <button type="button"  class="btn btn-danger px-4 rounded-3 form-control" @click="reset()"> !!! RESET !!!</button>
<Footer />
</template>

<style scoped></style>
