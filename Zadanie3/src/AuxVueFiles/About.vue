<script setup>
import { ref } from "vue";

const zobrazitOstranke = ref(false);
</script>

<template>
  <section id="o-stranke" class="container my-4">
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4">

        <button
            class="btn btn-link text-decoration-none text-dark fw-bold p-0 w-100 d-flex justify-content-between align-items-center"
            @click="zobrazitOstranke = !zobrazitOstranke"
            :aria-expanded="zobrazitOstranke"
        >
          <span class="fs-5">O stránke</span>

          <span class="fs-4">
            {{ zobrazitOstranke ? '−' : '+' }}
          </span>
        </button>

        <div v-if="zobrazitOstranke" class="mt-4">
          <hr>

          <h5 class="fw-bold mb-3">O projekte</h5>

          <p class="text-secondary">
            Táto aplikácia slúži na správu a organizáciu úloh.
            Používateľovi umožňuje vytvárať, upravovať a odstraňovať úlohy,
            označovať ich ako dokončené alebo nedokončené a plánovať ich
            pomocou prehľadného kalendára.
          </p>

          <h6 class="fw-bold mt-4">Použité technológie</h6>

          <ul class="text-secondary">
            <li>Vue 3 – tvorba používateľského rozhrania</li>
            <li>JavaScript – aplikačná logika a spracovanie údajov</li>
            <li>Bootstrap 5 – vzhľad a responzívny dizajn</li>
            <li>REST API – komunikácia so serverom a práca s údajmi</li>
          </ul>

          <h6 class="fw-bold mt-4">Kalendárová knižnica</h6>

          <p class="text-secondary mb-0">
            Na zobrazovanie a plánovanie úloh v kalendári je použitá
            knižnica FullCalendar pre Vue 3. Umožňuje zobrazovať úlohy
            v mesačnom, týždennom a dennom prehľade.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>