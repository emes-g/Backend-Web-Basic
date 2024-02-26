const testFolder = 'data';  // 내가 실행하는 위치를 기준으로 해서 data 디렉토리의 경로를 정해주면 된다.
const fs = require('fs');

fs.readdir(testFolder, function(error, filelist){
    console.log(filelist);
});