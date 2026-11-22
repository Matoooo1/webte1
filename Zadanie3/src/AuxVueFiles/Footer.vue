<template>
<footer class="bg-dark text-white text-center p-2">
<p class="mb-2">Martin Pupava 2026</p>
  <div class="container">
    <p class="fw-bold mb-1">Použité technológie a knižnice</p>

    <div class="d-flex flex-wrap justify-content-center gap-3 mb-3">
      <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer" class="footer-link">
        Vue 3
      </a>
      <a href="https://getbootstrap.com/" target="_blank" rel="noopener noreferrer" class="footer-link">
        Bootstrap 5
      </a>

      <a href="https://fullcalendar.io/" target="_blank" rel="noopener noreferrer" class="footer-link">
        FullCalendar
      </a>

      <a href="https://restfulapi.net/" target="_blank" rel="noopener noreferrer" class="footer-link">
        REST API
      </a>
      </div>
    </div>
</footer>
</template>

<style scoped>
.footer-link {
  color: lightgray;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: white;
  text-decoration: underline;
}
</style>