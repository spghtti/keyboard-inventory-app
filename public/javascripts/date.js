const dropdown = document.getElementById('status');
const div = document.querySelector('.date-sold-container');

dropdown.value === 'Sold' ? (div.style.display = 'inherit') : '';

function checkForSold() {
  const value = document.getElementById('status').value;
  value === 'Sold'
    ? (div.style.display = 'inherit')
    : (div.style.display = 'none');
}
