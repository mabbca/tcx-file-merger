const parser = require('xml2json');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const { stringify } = require('querystring');

exports.call = function() {
  const tcxFiles = this.getFiles();
  const jsonFiles = this.convertFilesToJson(tcxFiles);
  const heartRateFileIndex = this.getHeartRateFileIndex(jsonFiles);

  const heartRateFile = jsonFiles[heartRateFileIndex];
  const speedFile = jsonFiles[1 - heartRateFileIndex];

  let mergedFile = this.mergeGeneralData(heartRateFile, speedFile);
  mergedFile = this.logObjectEachTimeSpeedIsFound(heartRateFile, mergedFile);

  return this.createNewFile(mergedFile);
}

exports.getFiles = function() {
  const filePathList = fs.readdirSync(path.resolve('./files')).map(fileName => {
    if (fileName.includes('-heartrate') || fileName.includes('-speed')) {
      return path.join(path.resolve('files'), fileName) 
    } 
  }).filter(function (el) { return typeof el !== 'undefined' });
  
  const filePathListContainsFiles = !!filePathList.find(fileName => {
    return fs.lstatSync(fileName).isFile()
  });

  if (filePathList.length === 2 && filePathListContainsFiles) {
    const files = filePathList.map(filePath => {
      const file = fs.readFileSync(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        return data;
      })
      return file;
    })

    return files;
  } else {
    throw new Error('There should be two files in the folder')
  }
}

exports.convertFilesToJson = function(tcxFiles) {
  return tcxFiles.map(file => {
    return JSON.parse(parser.toJson(file, {reversible: true}));
  })
}

exports.getHeartRateFileIndex = function(files) {
  return files.findIndex(file => {
    const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
    const trackpointsArray = Object.values(trackpoints);
    return trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
  })
}

exports.getFileTrackpointsArray = function(file) {
  return file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
}

exports.logObjectEachTimeSpeedIsFound = function(hrFile, speedFile) {
  hrFileTrackpoints = this.getFileTrackpointsArray(hrFile);
  speedFileTrackpoints = this.getFileTrackpointsArray(speedFile);

  notFoundCount = 0;
  foundCount = 0;
  newSpeedFileTrackpointList = [];
  
  // ça ajoute pas un heartrate partout (et ça prend pas non plus tous les datas de heartrate), à voir si j'essaie pas une solution pour smoother le data 
  speedFileTrackpoints.forEach(tp => {
    const speedTime = tp.Time;
    hrObject = this.findObjectWithCorrespondingTime(speedTime, hrFileTrackpoints)
    if (hrObject) {
      tp['HeartRateBpm'] = hrObject.HeartRateBpm;
    }
  });

  return speedFile;
}

exports.mergeGeneralData = function(hrFile, speedFile) {
  speedFile.TrainingCenterDatabase.Activities.Activity.Sport = speedFile.TrainingCenterDatabase.Activities.Activity.Sport;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['Calories'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.Calories;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['AverageHeartRateBpm'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.AverageHeartRateBpm;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['MaximumHeartRateBpm'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.MaximumHeartRateBpm;
  return speedFile;
}

exports.createNewFile = function(content) {
  let stringified = JSON.stringify(content);
  return parser.toXml(stringified);
}

exports.findObjectWithCorrespondingTime = function(time, trackpointsArray) {
  return trackpointsArray.find(tp => tp.Time['$t'] === time['$t']);
}

// http://www.curtismlarson.com/blog/2018/10/03/edit-xml-node-js/

// 1. obtenir le data des deux fichiers
// 2. déterminer quel fichier a le hr pis lequel a la vitesse
// 3. créer un nouveau fichier vide
// 4. pour chaque trackpoint avec le meme time, ajouter le hrbpm data à la suite des watts pis l'ajouter à une liste de trackpoints
// 5. merger les infos de base du header
// 6. ajouter le header dans l'fichier pis lui mettre les trackpoints dedans, save it
// 7. use typescript :)