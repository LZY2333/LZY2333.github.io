const simpleGit = require('simple-git');
const git = simpleGit();
git
.init()
.add('.')
.commit(global.process.argv[2])
.push([],()=> {
    console.log("Push to master success");
})
// 下面是默认的参数
// const options = {
//     baseDir: process.cwd(),
//     binary: 'git',
//     maxConcurrentProcesses: 6,
//  };