const http = require('http');
const parser = require('xml2json');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

getFiles = () => {
  const filePathList = fs.readdirSync(path.resolve('files')).map(fileName => {
    return path.join(path.resolve('files'), fileName)
  })
  
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

convertFilesToJson = (tcxFiles) => {
  return tcxFiles.map(file => {
    return JSON.parse(parser.toJson(file, {reversible: true}));
  })
}

getHeartRateFileIndex = (files) => {
  return files.findIndex(file => {
    const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
    const trackpointsArray = Object.values(trackpoints);
    return trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
  })
}

getFileTrackpointsArray = (file) => {
  return file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
}


logObjectEachTimeSpeedIsFound = (hrFile, speedFile) => {
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
      newSpeedFileTrackpointList.push({
        ...tp,
        HeartRateBpm: hrObject.HeartRateBpm,
      });
    } else {
      newSpeedFileTrackpointList.push(tp);
    }
  });

  console.log(newSpeedFileTrackpointList)
  createNewFile(newSpeedFileTrackpointList);
}

createNewFile = (content) => {
  fs.writeFileSync('newFile.tcx', content);
}

findObjectWithCorrespondingTime = (time, trackpointsArray)  => {
  return trackpointsArray.find(tp => tp.Time === time);
} 

const tcxFiles = getFiles();
const jsonFiles = convertFilesToJson(tcxFiles);
const heartRateFileIndex = getHeartRateFileIndex(jsonFiles);

const heartRateFile = jsonFiles[heartRateFileIndex];
const speedFile = jsonFiles[1 - heartRateFileIndex];

// logObjectEachTimeSpeedIsFound(heartRateFile, speedFile);



// const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
// const trackpointsArray = Object.values(trackpoints);
// console.log(trackpointsArray.length);

// const hasHeartRateBPM = trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
// console.log(!!hasHeartRateBPM);

// console.log(tcxFiles);

// 1. obtenir le data des deux fichiers
// 2. déterminer quel fichier a le hr pis lequel a la vitesse
// 3. créer un nouveau fichier vide
// 4. pour chaque trackpoint avec le meme time, ajouter le hrbpm data à la suite des watts pis l'ajouter à une liste de trackpoints
// 5. merger les infos de base du header
// 6. ajouter le header dans l'fichier pis lui mettre les trackpoints dedans, save it