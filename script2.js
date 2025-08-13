let serieNo=10;

function search(searchTerm) {
  const searchEpisodes = allEpisodes.filter(
    (episode) =>
      episode.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  makePageForEpisodes(searchEpisodes, allEpisodes.length);
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

function createSeriesCard(serie) {
  const template = document.getElementById("serie-card");
  const card = template.content.cloneNode(true);

  const episodeCode = formatEpisodeCode(serie.season, serie.number);
  card.querySelector("h3").textContent = serie.name;
  card.querySelector("img").src = serie.image.medium;
  card.querySelector("img").alt = serie.name;
  card.querySelector(".summary").innerHTML = serie.summary;
  card.querySelector(".rate").innerHTML = serie.rate;
  card.querySelector(".genres").innerHTML = serie.genres;
  card.querySelector(".status").innerHTML = serie.status;
  card.querySelector(".runtime").innerHTML = serie.runtime;
  return card;
}

function makePageForEpisodes(episodeList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${episodeList.length} / ${numberOfTotal} Episodes`;

  const container = document.getElementById("container");
  container.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);
  episodeCards.forEach((card) => container.appendChild(card));
}

function makePageForSeries(seriesList, numberOfTotal) {
  const rootElem = document.getElementById("episode-count");
  rootElem.textContent = `${seriesList.length} / ${numberOfTotal} Series`;

  const container = document.getElementById("container");
  container.innerHTML = "";

  const serieCards = seriesList.map(createSeriesCard);
  serieCards.forEach((card) => container.appendChild(card));
}

document.getElementById("searchInput").addEventListener("input", function () {
  search(this.value);
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

    if (index === "") {
      //makePageForSeries(allSeries, allSeries.length);
    } else {
      //makePageForSeries(allSeries[index], allSeries.length);
    }
    serieNo=[allSeries[index]].Id
    const allEpisodes = getAllEpisodes(serieNo);
    makePageForEpisodes(allEpisodes, allEpisodes.length);
    await populateEpisodeSelect(serieNo);
  });

async function getAllSeries() {
  const url = "https://api.tvmaze.com/shows";
  await fetch(url);
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function getAllEpisodes(serieNo) {
  const url = "https://api.tvmaze.com/shows/" + serieNo + "/episodes";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function populateSeriesSelect() {
  const select = document.getElementById("seriesSelect");
  const allSeries = await getAllSeries();
  makePageForSeries(allSeries, allSeries.length);

  allSeries.forEach((serie, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = serie.name;
    select.appendChild(option);
  });
}
async function populateEpisodeSelect(serieNo) {
  const allEpisodes = await getAllEpisodes(serieNo);
  const select = document.getElementById("episodeSelect");

  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = episode.name;
    select.appendChild(option);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await populateSeriesSelect();
 });
