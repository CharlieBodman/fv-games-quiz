import Game from './scripts/game';

document.addEventListener("DOMContentLoaded", function (event) {
    Game.init(document.body, {});
    
    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        console.log(features);
      } catch (e) {
        console.error(e);
        // document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
      }
});

