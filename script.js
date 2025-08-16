let seriesNo = {};
let allSeries=[];
let allEpisodes=[];
let showFlag=true;
//You can edit ALL of the code here

async function setup() {
  allEpisodes = await fetchEpisodes(); //Get all episodes from episode.js
  
  makePageForEpisodes(allEpisodes, allEpisodes.length); //Generate the episode cards.
  populateEpisodeSelect();
};

async function fetchEpisodes() {
  const url = `https://api.tvmaze.com/shows/82/episodes`;
  const response = await fetch(url);     
  const data = await response.json(); 
  return data;   
  };

function search(searchText) {
  const searchEpisodes = allEpisodes.filter(
    (episode) =>
      episode.summary.toLowerCase().includes(searchText.toLowerCase()) ||
      episode.name.toLowerCase().includes(searchText.toLowerCase())
  );
  makePageForEpisodes(searchEpisodes, allEpisodes.length);
}

function searchForShow(searchText) {
  const searchEpisodes = allSeries.filter(
    (serie) =>
      serie.summary.toLowerCase().includes(searchText.toLowerCase()) ||
      serie.name.toLowerCase().includes(searchText.toLowerCase())
  );
  makePageForSeries(searchEpisodes, allEpisodes.length);
}

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
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
  //console.log(series.id);
  const template = document.getElementById("series-card");
  const card = template.content.cloneNode(true);

  const episodeCode = formatEpisodeCode(series.season, series.number);
  card.querySelector("h3").textContent = series.name;
  card.querySelector("h3").addEventListener("click", async function () {
    console.log("click"+series.id)
    const index = series.id;
    const allSeries = await getAllSeries();
    allEpisodes = await getAllEpisodes(index); // Store globally
    await populateEpisodeSelect(index, allEpisodes);
    makePageForEpisodes(allEpisodes, allEpisodes.length);
    selected = "episode";
    document.getElementById("series-selection").hidden = true;
    document.getElementById("btnVisible").hidden = false;
  });
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
  showFlag=false;
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${episodeList.length} / ${numberOfTotal} Episodes`;

  const container = document.getElementById("container");
  container.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);
  episodeCards.forEach((card) => container.appendChild(card));
}

function makePageForSeries(seriesList, numberOfTotal) {
  showFlag=true;
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${seriesList.length} / ${numberOfTotal} Series`;

  const container = document.getElementById("container");
  container.innerHTML = "";

  const seriesCards = seriesList.map(createSeriesCard);
  seriesCards.forEach((card) => container.appendChild(card));
}

document.getElementById("searchInput").addEventListener("input", function () {

  if (!showFlag) {
    search(this.value);
  }
  else {
    searchForShow(this.value);
  }

});

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

document
  .getElementById("seriesSelect")
  .addEventListener("change", async function () {
    const allSeries = await getAllSeries();
    const index = this.value;
    seriesNo = allSeries[index].id;
    allEpisodes = await getAllEpisodes(seriesNo); // Store globally
    await populateEpisodeSelect(seriesNo, allEpisodes);
    makePageForEpisodes(allEpisodes, allEpisodes.length);
  });
  
  document
  .getElementById("btnVisible")
  .addEventListener("click", async function () {
    document.getElementById("btnVisible").hidden = false;
    const select = document.getElementById("seriesSelect");
    const episodeSlection = document.getElementById("episodeSelect");
    allSeries = await getAllSeries();
    makePageForSeries(allSeries, allSeries.length);

    allSeries.forEach((serie, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = serie.name;
      select.appendChild(option);
    });
  });

async function getAllSeries() {

  if (allSeries.length===0){
    const url = "https://api.tvmaze.com/shows";
  await fetch(url);
  const response = await fetch(url);
   allSeries = await response.json();
  }

  return allSeries;
}
async function getAllEpisodes(seriesNo) {
  const url = "https://api.tvmaze.com/shows/" + seriesNo + "/episodes";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function populateSeriesSelect() {
  const select = document.getElementById("seriesSelect");
  const episodeSelection = document.getElementById("episodeSelect");
  const allSeries = await getAllSeries();
  makePageForSeries(allSeries, allSeries.length);
 allSeries.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  
  allSeries.forEach((series) => {
    const option = document.createElement("option");
    option.value = series.id;
    option.textContent = series.name;
    select.appendChild(option);
  });
}
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

window.addEventListener("DOMContentLoaded", async () => {
  await populateSeriesSelect();
});
