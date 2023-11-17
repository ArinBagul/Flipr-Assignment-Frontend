// Fetch prizes function
async function fetchPrizes() {
    try {
        const response = await fetch('https://api.nobelprize.org/v1/prize.json');
        const data = await response.json();
        return data.prizes;
    } catch (error) {
        console.error('Error fetching prizes:', error);
        alert('Error, Please be patient while we are trying to resolve the issue. Please try again after some time');
        return [];
    }
}

// Display prizes function
function displayPrizes(prizes) {
  const prizeList = document.getElementById('prize-list');
  prizeList.innerHTML = ''; // Clear previous content

  prizes.forEach(prize => {
    const prizeItem = document.createElement('li');
    prizeItem.innerHTML = `
      <div class="prize-heading">
        ${prize.year} - ${prize.category}
      </div>
      <div class="prize-content">
        <span class="bold">Laureates:</span> ${getLaureateNames(prize.laureates)}<br>
        <span class="bold">Motivation:</span> ${getMotivation(prize.laureates)}
      </div>
    `;

    prizeList.appendChild(prizeItem);
  });
}

// Helper function to get laureate names
function getLaureateNames(laureates) {
  return laureates ? laureates.map(laureate => `${laureate.firstname} ${laureate.surname}`).join(', ') : '';
}

// Helper function to get motivation (only once)
function getMotivation(laureates) {
  return laureates && laureates.length > 0 ? laureates[0].motivation : '';
}



// Populate dropdowns function
function populateDropdowns(prizes) {
    const categories = ['All Categories',...new Set(prizes.map(prize => prize.category))];
    const years = Array.from({ length: 2018 - 1900 + 1 }, (_, index) => 2018 - index);

    const categoryDropdown = document.getElementById('category-dropdown');
    const yearDropdown = document.getElementById('year-dropdown');

    // Clear previous options
    categoryDropdown.innerHTML = '';
    yearDropdown.innerHTML = '';

    // Populate category dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category === 'All Categories' ? '' : category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });

    // Populate year dropdown with "All Years" option
    const allYearsOption = document.createElement('option');
    allYearsOption.value = 'all';
    allYearsOption.textContent = 'All Years';
    yearDropdown.appendChild(allYearsOption);

    // Populate year dropdown
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    });
}


const categoryDropdown = document.getElementById('category-dropdown');
const yearDropdown = document.getElementById('year-dropdown');

categoryDropdown.addEventListener('change', updateFilters);
yearDropdown.addEventListener('change', updateFilters);

async function updateFilters() {
    const selectedCategory = categoryDropdown.value;
    const selectedYear = yearDropdown.value;

    const filteredPrizes = filterPrizes(await fetchPrizes(), selectedCategory, selectedYear);

    // Update the display with the filtered prizes
    displayPrizes(filteredPrizes);
    displayMultipleWinners(filteredPrizes);
}

// Filter prizes function
function filterPrizes(prizes, selectedCategory, selectedYear) {
    return prizes.filter(prize =>
        (!selectedCategory || prize.category === selectedCategory) &&
        (selectedYear === 'all' || parseInt(prize.year) === parseInt(selectedYear))
    );
}

// Display multiple winners function
function displayMultipleWinners(prizes) {
    const multipleWinnersSection = document.getElementById('multiple-winners-list');
    multipleWinnersSection.innerHTML = ''; // Clear previous content
  
    const multipleWinnersSet = new Set();
    const multipleWinnersInfo = [];
  
    prizes.forEach(prize => {
      const laureates = prize.laureates || [];
  
      laureates.forEach(laureate => {
        const fullName = `${laureate.firstname} ${laureate.surname}`;
        if (multipleWinnersSet.has(fullName)) {
          multipleWinnersInfo.push({
            name: fullName,
            year: prize.year,
            motivation: laureate.motivation
          });
        } else {
          multipleWinnersSet.add(fullName);
        }
      });
    });
  
    // Display unique names
    multipleWinnersInfo.forEach(winner => {
      const winnerInfo = document.createElement('li');
      winnerInfo.innerHTML = `<strong>${winner.name}</strong>`;
      multipleWinnersSection.appendChild(winnerInfo);
    });
  }
  

// Find multiple winners function
function findMultipleWinners(prizes) {
    const laureates = prizes.flatMap(prize => prize.laureates);
    const winnerCounts = laureates.reduce((counts, laureate) => {
        if (laureate && laureate.id) {
            counts[laureate.id] = (counts[laureate.id] || 0) + 1;
        }
        return counts;
    }, {});

    return laureates.filter(laureate => laureate && laureate.id && winnerCounts[laureate.id] > 1);
}


// Main function to initiate the process
async function main() {
    const prizes = await fetchPrizes();
    displayPrizes(prizes);
    populateDropdowns(prizes);
    displayMultipleWinners(prizes);
}

// Run the main function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);
