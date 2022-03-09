const simpleGit = require('simple-git');
const git = simpleGit();
git
.init()
.add('.')
.commit(global.process.argv[2])
.push([],()=> {
    console.log("Push to master success");
}) 
