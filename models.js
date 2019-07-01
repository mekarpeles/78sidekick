
const fetch = require('node-fetch');
const genres = require('./client/src/genres.js')

// uses a regex to find a flac file for a given item
const findFlac = (files) => {
  const flac = /flac$/&&/^_/;
  for (let i = 0; i < files.length; i += 1) {
    if (flac.test(files[i].original)) {
      console.log('file i inside if', files[i].original);
      return files[i].original;
    }
  }
}

// fetches metadata from a specific item using the IA URL according to their formula
const fetchMetadata = (id, callback) => {
  let metadataUrl = `https://archive.org/metadata/${id}`
  fetch(metadataUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      callback(null, myJson);
    })
}

// fetches items based on year and genre using the IA Advanced Search
const fetchSong = (genre, year, callback) => {

let songUrl = `https://archive.org/advancedsearch.php?q=collection%3A%28georgeblood%29+AND+subject%3A%28${genre}%29+AND+YEAR%3A%28${year}%29&fl%5B%5D=identifier&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=10000&page=1&output=json`
    fetch(songUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      let totalResults = myJson.response.docs.length;
      if (totalResults === 0) {
        // do something
      }
      // select a random item based on the number of available results
      let randomIndex = generateRandomIndex(totalResults);
      let identifier = myJson.response.docs[randomIndex].identifier ;
      // fetch specific metadata of item and prepare object to send to client
      fetchMetadata(identifier, (err, result) => {
        if (err) { throw err };
        let metadata = {};
        metadata.file = findFlac(result.files)
        metadata.creator = result.metadata.creator[0];
        metadata.title = result.metadata.title;
        metadata.runtime = result.metadata.runtime;
        metadata.identifier = identifier;
        metadata.genre = genre;
        metadata.year = year;
        callback(null, metadata)
      });
    });
}

// selects a random genre from a genres array in genres.js
const generateRandomGenre = () => {
  let randomIndex = Math.random() * (21 - 0) + 0;
  randomIndex = Math.floor(randomIndex);
  let randomGenre = genres.genres[randomIndex];
  console.log('randomgenre', randomGenre);
  return randomGenre;
}

// selects a result at random based on total number of results from API call
const generateRandomIndex = (totalResults) => {
  let randomYear = Math.random() * (totalResults - 0) + 0;
  randomYear = Math.floor(randomYear);
  return randomYear;
}

// uses available years to select a random year if corresponding switch is turn ON
const generateRandomYear = () => {
  let randomYear = Math.random() * (1960 - 1900) + 1900;
  randomYear = Math.floor(randomYear);
  return randomYear;
}

module.exports = { fetchMetadata, fetchSong, generateRandomYear, generateRandomGenre }