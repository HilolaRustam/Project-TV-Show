//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes(); //Get all episodes from episode.js
  makePageForEpisodes(allEpisodes, allEpisodes.length); //Generate the episode cards.
};

function search(search) {
  const allEpisodes = getAllEpisodes(); //Get all episodes from episode.js
  console.log(allEpisodes[0].name);
  const searchEpisodes = allEpisodes.filter(
    (episode) =>
      episode.summary.toLowerCase().includes(search.toLowerCase()) ||
      episode.name.toLowerCase().includes(search.toLowerCase())
  );
  makePageForEpisodes(searchEpisodes, allEpisodes.length); //Generate the episode cards.
};
// This function helps formate episode code as S02E04
function formatEpisodeCode(season, number) {
  const seasonStr = season.toString().padStart(2, "0");
  const numberStr = number.toString().padStart(2, "0");
  return `S${seasonStr}E${numberStr}`;
};
// Create a card for each episode from the template.
function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card"); //Get the template element.
  const card = template.content.cloneNode(true); //Clone the template

  // Format episode code
  const episodeCode = formatEpisodeCode(episode.season, episode.number);
  // Fill in the episode details in the cloned template.
  card.querySelector("h3").textContent = `${episodeCode} - ${episode.name}`;
  card.querySelector("img").src = episode.image.medium;
  card.querySelector("img").alt = episode.name;
  card.querySelector(".summary").innerHTML = episode.summary;
  return card; //return the filled card.
};
//Function that generates and appends all episode cards to the page.
function makePageForEpisodes(episodeList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${episodeList.length} /${numberOfTotal} Episodes`; //Show count at top

  const container = document.getElementById("container");
  container.innerHTML=""; //Clear any existing content.

  // Use map to create an array of cards
  const episodeCards = episodeList.map(createEpisodeCard);

  // Append all episode cards to the container
  episodeCards.forEach((card) => container.appendChild(card));
}

document.getElementById("searchInput").addEventListener("input", function () {
  const searchText = this.value;
  search(searchText); // This function should be defined elsewhere
});

document.getElementById("episodeSelect").addEventListener("change", function () {
    const index = this.value;
    if (index === "") {
      makePageForEpisodes(getAllEpisodes()); // show all episodes
    } else {
      const selectedEpisode = getAllEpisodes()[index];
      makePageForEpisodes([selectedEpisode]); // show only selected
    }
  });
function populateEpisodeSelect() {
  const allEpisodes = getAllEpisodes(); // Get episodes from your episode.js
  const select = document.getElementById("episodeSelect");

  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    option.value = index; // or you can use a unique ID if available
    option.textContent = `${episode.name}`;
    select.appendChild(option);
  });
}

window.addEventListener("DOMContentLoaded", populateEpisodeSelect);
window.onload = setup;
