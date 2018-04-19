const AVATAR_DIRECTORY = __dirname+'/../public/images/avatars';

const find = require('find');

const getAvatarList = () => {
  return find.fileSync(/\.png$/,AVATAR_DIRECTORY).filter((element) => !element.includes('/notused/')).map((element) => {
    let pathComponents = element.split('/public/');
    return pathComponents[pathComponents.length-1];
  })
}

module.exports = {
  getAvatarList
}