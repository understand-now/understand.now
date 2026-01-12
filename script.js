mdToHtml = (md) => {
  return `<p class="first">` + md
    .replace(/([^ ]+)/, "<span>$1</span>")
    .replaceAll("\n\n", "</p>\n<p>")
    .replaceAll("<p>>", `<p class="quote">`)
    .replaceAll(" -- ", " — ")
    .replaceAll(/[_]([^_]+)[_]/g, "<i>$1</i>")
    .replaceAll(/[*][*]([^*]+)[*][*]/g, "<b>$1</b>")
    .replaceAll(/[~][~]([^~]+)[~][~]/g, "<s>$1</s>")
    + "</p>"
};

$(document).ready(() => {
  $("#open-menu").click(function() {
    $("#menu").addClass("visible");
  });
  $("#close-menu").click(function() {
    $("#menu").removeClass("visible");
    $.ajax({
      url: "/test.md"
    }).done(function(data) {
      $("#content").html(mdToHtml(data));
    })
  });
});
