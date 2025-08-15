let seriesNo = {};
let allEpisodes = [];
let allSeriesList = [];
let currentView = "series";
const fetchCache = {}; // catch for fetch results

// fetch with caching                     //Fetches data from a URL but saves it in a cache to avoid making the same request multiple times.
async function fetchWithCache(url) {
  if (fetchCache[url])return fetchCache[url];  // Return cached version if exists
  const response = await fetch(url);
  const data = await response.json();
  fetchCache[url] = data;  // Store in cache
  return data;
}
//  Initial setup
async function setup() {  
  // Loads episodes for a default show (currently fixed to ID 82)
  allEpisodes = await fetchEpisodes(); 
  
  // Display episodes immediately on page load
  makePageForEpisodes(allEpisodes, allEpisodes.length); //Generate the episode cards.
  // Populate the episode dropdown for that default show
  populateEpisodeSelect();
}
// Fetch episodes
async function fetchEpisodes() {
  const url = `https://api.tvmaze.com/shows/82/episodes`;
  return await fetchWithCache(url);     
  }
//  Search Function for episodes
//  Filters the current show's episodes based on text entered into the search box.
//  Searches both episode name and summary.
function search(searchText) {
  const searchEpisodes = allEpisodes.filter(
    (episode) =>
      episode.summary.toLowerCase().includes(searchText.toLowerCase()) ||
      episode.name.toLowerCase().includes(searchText.toLowerCase())
  );
  makePageForEpisodes(searchEpisodes, allEpisodes.length);
}
//  Episode code formatter 
//  Converts season and episode numbers into format SxxExx
function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2,"0")}`;
}
//  Card creation for episodes
//  Creates an episode card from a template.
function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card");
  const card = template.content.cloneNode(true); // clone template

  const episodeCode = formatEpisodeCode(episode.season, episode.number);
  card.querySelector("h3").textContent = `${episodeCode} - ${episode.name}`;
  card.querySelector("img").src = episode.image.medium;
  card.querySelector("img").alt = episode.name;
  card.querySelector(".summary").innerHTML = episode.summary;
  return card;
}
// Card creation for Series
// Creates a series card from a template.
function createSeriesCard(series) {
  const template = document.getElementById("series-card");
  const card = template.content.cloneNode(true);

  card.querySelector(".series").dataset.id = series.id; // Store series ID in HTML
  card.querySelector("h3").textContent = series.name;
  card.querySelector("img").src = series.image.medium;
  card.querySelector("img").alt = series.name;
  card.querySelector(".summary").innerHTML = series.summary;
  card.querySelector(".rate").innerHTML = series.rate;
  card.querySelector(".genres").innerHTML = series.genres;
  card.querySelector(".status").innerHTML = series.status;
  card.querySelector(".runtime").innerHTML = series.runtime;
  return card;
}
//  Render Episodes page
//  Shows the episode cards for the current view.
function makePageForEpisodes(episodeList, numberOfTotal) {
  // // Update episode counter text
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${episodeList.length} / ${numberOfTotal} Episodes`;
 // Show episodes container, hide series container
  document.getElementById("episode-container").style.display = "";
  document.getElementById("series-container").style.display = "none";
// Clear current episodes
  const container = document.getElementById("episode-container");
  container.innerHTML = "";
// Create and add episode cards
  const episodeCards = episodeList.map(createEpisodeCard);
  episodeCards.forEach((card) => container.appendChild(card));
}
// Renders Series page
// Shows the list of TV series cards.
function makePageForSeries(seriesList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${seriesList.length} / ${numberOfTotal} Series`;
  // Show series container, hide episodes container
  document.getElementById("series-container").style.display = "";
  document.getElementById("episode-container").style.display = "none";
  // Clear current series
  const seriesContainer = document.getElementById("series-container");
  seriesContainer.innerHTML = "";
  // Create and add series cards
  const seriesCards = seriesList.map(createSeriesCard);
  seriesCards.forEach((card) => seriesContainer.appendChild(card));
}
 // Search that handel both views series and episodes
document.getElementById("searchInput").addEventListener("input", function () {
  if (currentView === "series") {
     // Filter series list
    const text = this.value.toLowerCase();
    const filtered = allSeriesList.filter(series =>
      series.name.toLowerCase().includes(text) ||
      series.genres.join(", ").toLowerCase().includes(text) ||
      (series.summary && series.summary.toLowerCase().includes(text))
    );
    makePageForSeries(filtered, allSeriesList.length);
  } else {
    // Filter episodes list
  search(this.value);
  }
});
 // Episode select
document
  .getElementById("episodeSelect")
  .addEventListener("change", async function () {
    const index = this.value;

    if (index === "") {
      // Show all episodes if default selected
      makePageForEpisodes(allEpisodes, allEpisodes.length);
    } else {
      // Show single episode by index
      makePageForEpisodes([allEpisodes[index]], allEpisodes.length);
    }
  });
// Series select handler
document
  .getElementById("seriesSelect")
  .addEventListener("change", async function () {
    const index = this.value;
    if (!index) return;
    seriesNo = index;
    // Load episodes for that series
    allEpisodes = await getAllEpisodes(seriesNo); 
    // Populate episode dropdown
    await populateEpisodeSelect(seriesNo, allEpisodes);
    // Show episode view
    makePageForEpisodes(allEpisodes, allEpisodes.length);
    currentView = "episodes";
    backToSeriesBtn.style.display="inline-block";
  });
// Fetch all Series
async function getAllSeries() {
  const url = "https://api.tvmaze.com/shows";
  await fetch(url);
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
// Fetch all Episodes for a given series
async function getAllEpisodes(seriesNo) {
  const url = "https://api.tvmaze.com/shows/" + seriesNo + "/episodes";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
 // Populate Series Select
async function populateSeriesSelect() {
  const select = document.getElementById("seriesSelect");
  // Fetch and store all series
  allSeriesList = await getAllSeries(); 
  makePageForSeries(allSeriesList, allSeriesList.length);
  // Sort series alphabetically
  allSeriesList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  
  // Add each series to dropdown
  allSeriesList.forEach((series) => {
    const option = document.createElement("option");
    option.value = series.id;
    option.textContent = series.name;
    select.appendChild(option);
  });
}
// Populate Episodes select
async function populateEpisodeSelect(seriesNo, allEpisodes) {
  const select = document.getElementById("episodeSelect");
  select.innerHTML = ""; // Clear old options

  // Add a default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Episode";
  select.appendChild(defaultOption);

  // Add episode options
  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = episode.name;
    select.appendChild(option);
  });

  select.selectedIndex = 0; // Reset to the first option
}

// Click on series card to open episodes
document.getElementById("series-container").addEventListener("click", async (e) => {
  const seriesCard = e.target.closest(".series"); // Look for clicked series card
  if (seriesCard) {
    const seriesId = seriesCard.dataset.id;
    seriesNo = seriesId;
    allEpisodes = await getAllEpisodes(seriesId);
    await populateEpisodeSelect(seriesId, allEpisodes);
    makePageForEpisodes(allEpisodes, allEpisodes.length);
    currentView = "episodes";
    backToSeriesBtn.style.display = "inline-block";

  }
});

// Back to the Series Button
const backToSeriesBtn = document.getElementById("backToSeries");
backToSeriesBtn.textContent = "← Back to Series";
backToSeriesBtn.style.display = "none";
document.getElementById("root").prepend(backToSeriesBtn);

backToSeriesBtn.addEventListener("click", () => {
  makePageForSeries(allSeriesList, allSeriesList.length);
  currentView = "series";
  backToSeriesBtn.style.display = "none";
  document.getElementById("episodeSelect").innerHTML = "<option>-- Select an episode --</option>";
  document.getElementById("episode-count").textContent = `${allSeriesList.length} / ${allSeriesList.length} Series`;
});
// Start with shows list
window.addEventListener("DOMContentLoaded", async () => {
  await populateSeriesSelect();
});
