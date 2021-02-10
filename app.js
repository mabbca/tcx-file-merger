const parser = require('xml2json');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');

const express = require('express');
const { stringify } = require('querystring');
const server = express()
const hostname = '127.0.0.1';
const port = 3000;

server.get('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.send('Hello World!')
})

server.get('/generate_file', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml');

  const tcxFiles = getFiles();
  const jsonFiles = convertFilesToJson(tcxFiles);
  const heartRateFileIndex = getHeartRateFileIndex(jsonFiles);

  const heartRateFile = jsonFiles[heartRateFileIndex];
  const speedFile = jsonFiles[1 - heartRateFileIndex];

  let mergedFile = mergeGeneralData(heartRateFile, speedFile);
  mergedFile = logObjectEachTimeSpeedIsFound(heartRateFile, mergedFile);

  let xmlFile = createNewFile(mergedFile)

  res.setHeader('Content-disposition', 'attachment; filename=merged_file.tcx');
  res.setHeader('Content-type', 'text/xml');

  // on dirait que l'elevation est pas correcte, il faudrait voir si on doit pas aussi parser du stuff du fichier .gpx
  res.send(xmlFile);
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})

function getFiles() {
  const filePathList = fs.readdirSync(path.resolve('files')).map(fileName => {
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

function convertFilesToJson(tcxFiles) {
  return tcxFiles.map(file => {
    return JSON.parse(parser.toJson(file, {reversible: true}));
  })
}

function getHeartRateFileIndex(files) {
  return files.findIndex(file => {
    const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
    const trackpointsArray = Object.values(trackpoints);
    return trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
  })
}

function getFileTrackpointsArray(file) {
  return file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
}

function logObjectEachTimeSpeedIsFound(hrFile, speedFile) {
  hrFileTrackpoints = getFileTrackpointsArray(hrFile);
  speedFileTrackpoints = getFileTrackpointsArray(speedFile);

  notFoundCount = 0;
  foundCount = 0;
  newSpeedFileTrackpointList = [];
  
  // ça ajoute pas un heartrate partout (et ça prend pas non plus tous les datas de heartrate), à voir si j'essaie pas une solution pour smoother le data 
  speedFileTrackpoints.forEach(tp => {
    const speedTime = tp.Time;
    hrObject = findObjectWithCorrespondingTime(speedTime, hrFileTrackpoints)
    if (hrObject) {
      tp['HeartRateBpm'] = hrObject.HeartRateBpm;
    }
  });

  return speedFile;
}

function mergeGeneralData(hrFile, speedFile) {
  speedFile.TrainingCenterDatabase.Activities.Activity.Sport = speedFile.TrainingCenterDatabase.Activities.Activity.Sport;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['Calories'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.Calories;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['AverageHeartRateBpm'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.AverageHeartRateBpm;
  speedFile.TrainingCenterDatabase.Activities.Activity.Lap['MaximumHeartRateBpm'] = hrFile.TrainingCenterDatabase.Activities.Activity.Lap.MaximumHeartRateBpm;
  return speedFile;
}

function createNewFile(content) {
  let stringified = JSON.stringify(content);
  return parser.toXml(content);
}

function findObjectWithCorrespondingTime(time, trackpointsArray) {
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