<script setup>
import { ref, onMounted, computed } from "vue";
import { Health, GET } from "@/Logic/RestApi.js";
import FullCalendar from "@fullcalendar/vue3";
import '@fullcalendar/vue3/skeleton.css';
import '@fullcalendar/vue3/themes/forma/theme.css';
import '@fullcalendar/vue3/themes/forma/palettes/purple.css';
import Header from "@/AuxVueFiles/Header.vue";
import Footer from "@/AuxVueFiles/Footer.vue";
import About from "@/AuxVueFiles/About.vue";
import { LogicMain } from "@/Logic/LogicMain.js";
import { Calendar } from "@/Logic/Calendar.js";
import { formatDate, formatTime } from "@/Logic/TimeFormat.js";

const data = ref("");
const error = ref("");
const calendarRef = ref(null);
const filterUloh = ref("vsetky");
const zoradenieZoznamu = ref("datum");
const hladanyNazov = ref("");
const StudentOut = ref(null);

let UPDATE_CALENDAR = () => {};

const {
  error1,
  error2,
  loading,
  zobrazitUpravu,
  StudentOut_ONE,
  GET_ONE_ID_VARIABLE,
  TodoCreate,
  TodoRECreate,
  UPLOAUD_REDACO,
  reset,
  GET_ONLY_ONE,
  SHAPESHIFT,
  SCROLL,
  EDIT,
  Delete,
  DONE,
  UNDONE
} = LogicMain(StudentOut, () => UPDATE_CALENDAR());

const {
  calendarOptions,
  UPDATE_CALENDAR: UPDATE_CALENDAR_REAL
} = Calendar(TodoCreate, GET_ONE_ID_VARIABLE, GET_ONLY_ONE, formatDate);

UPDATE_CALENDAR = () => UPDATE_CALENDAR_REAL(StudentOut);

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

onMounted(async () => {
  loading.value = true;

  try {
    data.value = await Health();
    StudentOut.value = await GET("xpupava");
    UPDATE_CALENDAR();
    // console.log("response servera je:", data.value.statu);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Header />
  <p v-if="loading">Načítavam dáta zo servera...</p>
  <p v-else-if="error">
    Nastala chyba: {{ error }}, Správne fungovanie Stránky nie je možné
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
            <button class="btn btn-primary px-4 rounded-3 form-control" type="button" @click="SHAPESHIFT(uloha); SCROLL()">
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
    Chyba: {{ error }}
  </p>
  <section v-if="error1" class="container py-4">
    <p>{{ error1 }}</p>
  </section>
  <section v-else-if="StudentOut_ONE" class="container py-4">

    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4">

        <h3 class="fw-bold mb-3">
          {{ StudentOut_ONE.title }}
        </h3>

        <p class="text-secondary mb-4">
          {{ StudentOut_ONE.description || 'Bez popisu' }}
        </p>

        <hr>

        <div class="mb-3">
          <p class="fw-semibold mb-1">Začiatok úlohy</p>
          <p class="text-secondary mb-0">
            {{ formatTime(StudentOut_ONE.date_from) }}
          </p>
        </div>

        <div class="mb-3">
          <p class="fw-semibold mb-1">Koniec úlohy</p>
          <p class="text-secondary mb-0">
            {{ formatTime(StudentOut_ONE.date_to) }}
          </p>
        </div>

        <div class="mb-3">
          <p class="fw-semibold mb-1">Vytvorené</p>
          <p class="text-secondary mb-0">
            {{ formatTime(StudentOut_ONE.created_at) }}
          </p>
        </div>

      </div>
    </div>

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
  <h1 id="Kalendar" class="text-center"> Kalendár</h1>
  <section>  <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
  /> </section>
  <About />
  <button type="button"  class="btn btn-danger px-4 rounded-3 form-control" @click="reset()"> !!! RESET !!!</button>

<Footer />
</template>

<style scoped></style>
