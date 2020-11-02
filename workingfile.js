// const file2 = fs.readFileSync(path.resolve('files/london-speed.tcx'), 'utf8' , (err, data) => {
//   if (err) {
//     console.error(err)
//     return
//   }
//   return parser.parse(data);
//   const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
//   const trackpointsArray = Object.values(trackpoints);
  // console.log(trackpointsArray.length);

  // const hasHeartRateBPM = trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
  // console.log(!!hasHeartRateBPM);
// })

console.log(file1);
// const trackpoints = file1.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
// const trackpointsArray = Object.values(trackpoints);
// console.log(trackpointsArray);
// console.log(file2);


// getFiles = () => {
//   const folderName = 'files'
//   try {
//     if (!fs.existsSync(path.resolve(folderName))) {
//       throw new Error('Folder does not exists')
//     } else {
      
//       const filePathList = fs.readdirSync(path.resolve(folderName)).map(fileName => {
//         return path.join(path.resolve(folderName), fileName)
//       })
      
//       const filePathListContainsFiles = !!filePathList.find(fileName => {
//         return fs.lstatSync(fileName).isFile()
//       });

//       if (filePathList.length === 2 && filePathListContainsFiles) {
        
//         const file3 = fs.readFileSync(filePathList[0], 'utf8' , (err, data) => {
//           if (err) {
//             console.error(err)
//             return
//           }
//           return parser.parse(data);
//         })
        // console.log(file3);
        // const files = filePathList.map(filePath => {
        //   console.log(filePath)
        //   const bu = fs.readFileSync(filePath, 'utf8', (err, data) => {
        //     if (err) {
        //       console.error(err)
        //       return
        //     }
        //     // console.log(parser.parse(data));
        //     return parser.parse(data);
        //   })
        //   return bu;
        // })
        // console.log(files);

//       } else {
//         throw new Error('There should be two files in the folder')
//       }

    
//     }
//   } catch (err) {
//     console.error(err)
//   }
// }

// getFiles();

// const doSomethingAsync = () => {
//   return fs.readFile(path.resolve('example-files/london-heartrate.tcx'), 'utf8' , (err, data) => {
//     if (err) {
//       console.error(err)
//       return
//     }
//     const file = parser.parse(data);
//     const trackpoints = file.TrainingCenterDatabase.Activities.Activity.Lap.Track.Trackpoint;
//     const trackpointsArray = Object.values(trackpoints);
//     console.log(trackpointsArray.length);
  
//     const hasHeartRateBPM = trackpointsArray.find((trackpoint) => trackpoint.HeartRateBpm && trackpoint.HeartRateBpm.Value);
//     console.log(!!hasHeartRateBPM);
//   })
//   // return new Promise(resolve => {
//   //   setTimeout(() => resolve('I did something'), 3000)
//   // })
// }

// const doSomething = async () => {
//   console.log(await doSomethingAsync())
// }

