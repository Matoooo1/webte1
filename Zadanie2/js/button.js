const button = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");

$(document).ready(function () {
    $(".menu-button").on("click", function () {
        $(".menu").toggleClass("open");
    });
});