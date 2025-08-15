let seriesNo = {};
let allEpisodes = [];
let allSeriesList = [];
let currentView = "series";
const fetchCache = {}; // catch for fetch results

async function fetchWithCache(url) {
  if (fetchCache[url])return fetchCache[url];
  const response = await fetch(url);
  const data = await response.json();
  fetchCache[url] = data;
  return data;
}

async function setup() {
  allEpisodes = await fetchEpisodes(); 
  
  makePageForEpisodes(allEpisodes, allEpisodes.length); //Generate the episode cards.
  populateEpisodeSelect();
}

async function fetchEpisodes() {
  const url = `https://api.tvmaze.com/shows/82/episodes`;
  return await fetchWithCache(url);     
  }

function search(searchText) {
  const searchEpisodes = allEpisodes.filter(
    (episode) =>
      episode.summary.toLowerCase().includes(searchText.toLowerCase()) ||
      episode.name.toLowerCase().includes(searchText.toLowerCase())
  );
  makePageForEpisodes(searchEpisodes, allEpisodes.length);
}

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2,"0")}`;
}

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card");
  const card = template.content.cloneNode(true);

  const episodeCode = formatEpisodeCode(episode.season, episode.number);
  card.querySelector("h3").textContent = `${episodeCode} - ${episode.name}`;
  card.querySelector("img").src = episode.image.medium;
  card.querySelector("img").alt = episode.name;
  card.querySelector(".summary").innerHTML = episode.summary;
  return card;
}

function createSeriesCard(series) {
  const template = document.getElementById("series-card");
  const card = template.content.cloneNode(true);

  card.querySelector(".series").dataset.id = series.id;
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

function makePageForEpisodes(episodeList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${episodeList.length} / ${numberOfTotal} Episodes`;

  document.getElementById("episode-container").style.display = "";
  document.getElementById("series-container").style.display = "none";

  const container = document.getElementById("episode-container");
  container.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);
  episodeCards.forEach((card) => container.appendChild(card));
}

function makePageForSeries(seriesList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${seriesList.length} / ${numberOfTotal} Series`;

  document.getElementById("series-container").style.display = "";
  document.getElementById("episode-container").style.display = "none";

  const seriesContainer = document.getElementById("series-container");
  seriesContainer.innerHTML = "";

  const seriesCards = seriesList.map(createSeriesCard);
  seriesCards.forEach((card) => seriesContainer.appendChild(card));
}
 // Search that handel both views series and episodes
document.getElementById("searchInput").addEventListener("input", function () {
  if (currentView === "series") {
    const text = this.value.toLowerCase();
    const filtered = allSeriesList.filter(series =>
      series.name.toLowerCase().includes(text) ||
      series.genres.join(", ").toLowerCase().includes(text) ||
      (series.summary && series.summary.toLowerCase().includes(text))
    );
    makePageForSeries(filtered, allSeriesList.length);
  } else {
  search(this.value);
  }
});
 // Episode select
document
  .getElementById("episodeSelect")
  .addEventListener("change", async function () {
    const index = this.value;

    if (index === "") {
      makePageForEpisodes(allEpisodes, allEpisodes.length);
    } else {
      makePageForEpisodes([allEpisodes[index]], allEpisodes.length);
    }
  });
// Series select
document
  .getElementById("seriesSelect")
  .addEventListener("change", async function () {
    const index = this.value;
    if (!index) return;
    seriesNo = index;
    allEpisodes = await getAllEpisodes(seriesNo); // Stored globally
    await populateEpisodeSelect(seriesNo, allEpisodes);
    makePageForEpisodes(allEpisodes, allEpisodes.length);
    currentView = "episodes";
    backToSeriesBtn.style.display="inline-block";
  });

async function getAllSeries() {
  const url = "https://api.tvmaze.com/shows";
  await fetch(url);
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function getAllEpisodes(seriesNo) {
  const url = "https://api.tvmaze.com/shows/" + seriesNo + "/episodes";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
 // Populate Series Select
async function populateSeriesSelect() {
  const select = document.getElementById("seriesSelect");
  allSeriesList = await getAllSeries(); 
  makePageForSeries(allSeriesList, allSeriesList.length);
  allSeriesList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  
  
  allSeriesList.forEach((series) => {
    const option = document.createElement("option");
    option.value = series.id;
    option.textContent = series.name;
    select.appendChild(option);
  });
}
// Populate Episodes
async function populateEpisodeSelect(seriesNo, allEpisodes) {
  const select = document.getElementById("episodeSelect");
  select.innerHTML = ""; // Clear old options

  // Add a default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Episode";
  select.appendChild(defaultOption);

  // Add episodes
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
  const seriesCard = e.target.closest(".series");
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
