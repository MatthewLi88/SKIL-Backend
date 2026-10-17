// Matthew Li
// Event admin form: hide the Date and End time rows while "Is ongoing" is checked.
document.addEventListener('DOMContentLoaded', function () {
  var checkbox = document.getElementById('id_is_ongoing');
  if (!checkbox) return;

  var rows = ['date', 'end_time']
    .map(function (name) { return document.querySelector('.form-row.field-' + name); })
    .filter(Boolean);

  function sync() {
    rows.forEach(function (row) { row.style.display = checkbox.checked ? 'none' : ''; });
  }

  checkbox.addEventListener('change', sync);
  sync();
});
