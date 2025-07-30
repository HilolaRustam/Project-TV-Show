//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes(); //Get all episodes from episode.js
   makePageForEpisodes(allEpisodes);    //Generate the episode cards.
}
// This function helps formate episode code as S02E04
function formatEpisodeCode(season, number) {
  const seasonStr = season.toString().padStart(2, "0");
  const numberStr = number.toString().padStart(2, "0");
  return `S${seasonStr}E${numberStr}`;
}





window.onload = setup;
