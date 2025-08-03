const loanRange = document.getElementById('loanAmount');
const loanInput = document.getElementById('loanAmountInput');
const loanValue = document.getElementById('loanAmountValue');

const rateRange = document.getElementById('interestRate');
const rateInput = document.getElementById('interestRateInput');
const rateValue = document.getElementById('interestRateValue');

const tenureRange = document.getElementById('tenure');
const tenureInput = document.getElementById('tenureInput');
const tenureValue = document.getElementById('tenureValue');

const monthlyEmi = document.getElementById('monthlyEmi');
const totalInterest = document.getElementById('totalInterest');
const totalPayment = document.getElementById('totalPayment');

function updateRangeFill(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);

  const percent = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percent}%, #ddd ${percent}%, #ddd 100%)`;
}

function syncSliderWithInput(slider, input, label) {
  const update = () => {
    input.value = slider.value;
    label.textContent = slider.value;
    updateRangeFill(slider);
    updateCalculation();
  };
  const updateSlider = () => {
    slider.value = input.value;
    label.textContent = input.value;
    updateRangeFill(slider);
    updateCalculation();
  };

  slider.addEventListener('input', update);
  input.addEventListener('input', updateSlider);

  // Initial fill
  updateRangeFill(slider);
}

function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalAmount = emi * totalMonths;
  const totalInterest = totalAmount - principal;

  return {
    emi: emi.toFixed(2),
    interest: totalInterest.toFixed(2),
    total: totalAmount.toFixed(2),
  };
}

function updateCalculation() {
  const principal = parseFloat(loanInput.value);
  const interestRate = parseFloat(rateInput.value);
  const tenure = parseFloat(tenureInput.value);

  if (isNaN(principal) || isNaN(interestRate) || isNaN(tenure)) return;

  const result = calculateEMI(principal, interestRate, tenure);

  // Get old values
  const oldEMI = parseInt(monthlyEmi.textContent.replace(/[₹, ]/g, '')) || 0;
  const oldInterest =
    parseInt(totalInterest.textContent.replace(/[₹, ]/g, '')) || 0;
  const oldTotal =
    parseInt(totalPayment.textContent.replace(/[₹, ]/g, '')) || 0;

  // Animate new values
  animateValue('monthlyEmi', oldEMI, parseFloat(result.emi));
  animateValue('totalInterest', oldInterest, parseFloat(result.interest));
  animateValue('totalPayment', oldTotal, parseFloat(result.total));
}

const rowsPerPage = 12;
let emiRows = [];

function generateGrid() {
  generateEmiTable();
  document.getElementById('emiTableContainer').classList.remove('d-none');
}

function generateEmiTable() {
  const principal = parseFloat(
    document.getElementById('loanAmountInput').value
  );
  const tenureYears = parseFloat(document.getElementById('tenureInput').value);
  const annualInterestRate = parseFloat(
    document.getElementById('interestRateInput').value
  );

  const tenureMonths = tenureYears * 12;
  const monthlyRate = annualInterestRate / 12 / 100;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  let balance = principal;
  emiRows = []; // clear previous rows

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;

    emiRows.push({
      month,
      emi: emi.toFixed(2),
      interest: interest.toFixed(2),
      principal: principalPaid.toFixed(2),
      balance: balance > 0 ? balance.toFixed(2) : '0.00',
    });
  }

  renderTablePage(1);
  renderPagination(emiRows.length, rowsPerPage);
}

function renderTablePage(page) {
  const tableBody = document.querySelector('#emiTable tbody');
  tableBody.innerHTML = '';

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const rows = emiRows.slice(start, end);

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${row.month}</td>
        <td>₹${row.emi}</td>
        <td>₹${row.interest}</td>
        <td>₹${row.principal}</td>
        <td>₹${row.balance}</td>
      `;
    tableBody.appendChild(tr);
  });
}

function renderPagination(totalRows, rowsPerPage) {
  const pageCount = Math.ceil(totalRows / rowsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-primary mx-1 bg-white text-black';
    btn.innerText = i;
    btn.addEventListener('click', () => renderTablePage(i));
    pagination.appendChild(btn);
  }
}

window.addEventListener('DOMContentLoaded', function () {
  syncSliderWithInput(loanRange, loanInput, loanValue);
  syncSliderWithInput(rateRange, rateInput, rateValue);
  syncSliderWithInput(tenureRange, tenureInput, tenureValue);
  updateCalculation(); // Initial load
});

function animateValue(id, start, end, duration = 300) {
  const el = document.getElementById(id);
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const current = Math.floor(start + range * (progress / duration));
    el.textContent = `₹ ${current.toLocaleString()}`;
    if (progress < duration) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = `₹ ${end.toLocaleString()}`;
    }
  }

  window.requestAnimationFrame(step);
}
