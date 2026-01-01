$(document).ready(() => {
  $("#open-menu").click(function() {
    $("#menu").addClass("visible");
  });
  $("#close-menu").click(function() {
    $("#menu").removeClass("visible");
    // $.ajax({
    //   url: "/test.md"
    // }).done(function(data) {
    //   $("#content").text(data);
    // })
  });
});
