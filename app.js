const darkModeToggle = document.querySelector('#dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
});

//Variables
const expenseForm = document.querySelector('#expense-form');
const expenseContainer = document.querySelector('#expense-container');
const editId = expenseForm.dataset.editId;
let expenses = [];

// Functions
function handleExpenseSubmit(e) {
  e.preventDefault();

  const description = DOMPurify.sanitize(expenseForm.querySelector('#description').value);
  const amount = parseFloat(DOMPurify.sanitize(expenseForm.querySelector('#amount').value));
  const date = DOMPurify.sanitize(expenseForm.querySelector('#date').value);

  const editId = expenseForm.dataset.editId;

  if (editId) {
    const editedExpenseIndex = expenses.findIndex(expense => expense.id === parseInt(editId));

    if (editedExpenseIndex !== -1) {
      expenses[editedExpenseIndex].description = description;
      expenses[editedExpenseIndex].amount = amount;
      expenses[editedExpenseIndex].date = date;

      delete expenseForm.dataset.editId;
      expenseForm.querySelector('input[type="submit"]').value = 'Add Expense';

      expenseContainer.dispatchEvent(new CustomEvent('refreshExpenses'));
    }
  } else {
    const newExpense = {
      description,
      amount,
      date,
      id: Date.now(),
    };
    expenses.push(newExpense);

    expenseContainer.dispatchEvent(new CustomEvent('refreshExpenses'));
  }

  e.target.reset();
}

function mirrorStateToLocalStorage() {
  localStorage.setItem('expenseContainer.list', JSON.stringify(expenses));
}

function loadinitialUI() {
  const tempLocalStorage = localStorage.getItem('expenseContainer.list');
  if (tempLocalStorage === null || tempLocalStorage.length === 0) return;
  const tempExpenses = JSON.parse(tempLocalStorage);
  expenses.push(...tempExpenses);
  expenseContainer.dispatchEvent(new CustomEvent('refreshExpenses'));
}

function deleteExpenseFromList(id) {
  expenses = expenses.filter(item => item.id !== id);
  expenseContainer.dispatchEvent(new CustomEvent('refreshExpenses'));
}

function displayExpenses() {
  const isDarkMode = document.body.classList.contains('dark-mode');

  const tempString = expenses.map(expense => `
    <div class="col">
      <div class="card mb-4 rounded-3 shadow-sm ${isDarkMode ? 'dark-mode' : ''}">
        <div class="card-header py-3 ${isDarkMode ? 'bg-dark text-light' : 'bg-primary text-white'} ${isDarkMode ? 'border-light' : 'border-primary'}">
          <h4 class="my-0">${expense.description}</h4>
        </div>
        <div class="card-body ${isDarkMode ? 'bg-dark text-light' : ''}">
          <ul class="text-start">
            <li>Amount: ₦${expense.amount.toFixed(2)}</li>
            <li>Date: ${expense.date}</li>
          </ul>
          <button class="btn btn-sm btn-outline-danger" aria-label="Delete ${expense.id}" value="${expense.id}">Delete</button>
          <button class="btn btn-sm btn-outline-secondary" aria-label="Edit ${expense.id}" value="${expense.id}">Edit</button>
        </div>
      </div>
    </div>
  `).join('');

  expenseContainer.innerHTML = tempString;
}



function handleEditExpense(id) {
  const expenseToEdit = expenses.find(expense => expense.id === id);
  if (!expenseToEdit) return;

  expenseForm.querySelector('#description').value = expenseToEdit.description;
  expenseForm.querySelector('#amount').value = expenseToEdit.amount;
  expenseForm.querySelector('#date').value = expenseToEdit.date;

  expenseForm.dataset.editId = id;

  expenseForm.querySelector('input[type="submit"]').value = 'Update Expense';
}

// Event listeners
expenseForm.addEventListener('submit', handleExpenseSubmit);
expenseContainer.addEventListener('refreshExpenses', displayExpenses);
document.addEventListener('DOMContentLoaded', loadinitialUI);
expenseContainer.addEventListener('click', (e) => {
  if (e.target.matches('.btn-outline-danger')) {
    deleteExpenseFromList(Number(e.target.value));
  } else if (e.target.matches('.btn-outline-secondary')) {
    handleEditExpense(Number(e.target.value));
  }
});
