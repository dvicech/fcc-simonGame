/*jshint esversion: 6 */
const colors = ['#FFC261', '#71E878', '#5460FF', '#E87B69'];
const audioFiles = [
  'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
  'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
  'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
  'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3',
];
const wins = 20;
let loaded = 0;
let track = [];
let userPlay = [];

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('strict').addEventListener('change', toggleStrictFont);

/* Firefox saves 'checked' when refreshing the page..?? */
document.getElementById('strict').checked = false;

/* Set colors on initial load */
for (let i = 0; i < 4; i++) {
  document.getElementById(`pad${i}`).style.backgroundColor = colors[i];
}

/* Change font color based on checkbox state */
function toggleStrictFont() {
  if (document.getElementById('strict').checked === true) {
    document.getElementById('label-strict').style.color = '#2196F3';
  } else {
    document.getElementById('label-strict').style.color = '#bdbdbd';
  }
}

/* Switch eventlistener of pads on / off */
function toggleEventListener(bool) {
  if (bool === 1) {
    for (let i = 0; i < 4; i++) {
      document.getElementById(`pad${i}`).addEventListener('click', playSound);
      document.getElementById(`pad${i}`).style.cursor = 'pointer';
    }
  } else if (bool === 0) {
    for (let i = 0; i < 4; i++) {
      document.getElementById(`pad${i}`).removeEventListener('click', playSound);
      document.getElementById(`pad${i}`).style.cursor = 'default';
    }
  }
}

/*
 * preload Audio files, based on: https://stackoverflow.com/questions/49792768/js-html5-audio-why-is-canplaythrough-not-fired-on-ios-safari
 */
function loadedAudio() {  // this will be called every time an audio file is loaded
  loaded++;   // we keep track of the loaded files vs the requested files
  if (loaded == audioFiles.length) { // all have loaded
    return;
  }
}

function preloadsounds() {
  for (var i in audioFiles) { // we start preloading all the audio files with html audio
    preloadAudio(audioFiles[i]);
  }
}

function preloadAudio(url) {
  var audio = new Audio();

  // once this file loads, it will call loadedAudio()
  // the file will be kept by the browser as cache
  audio.addEventListener('canplaythrough', loadedAudio, false);
  audio.addEventListener('error', function failed(e) {
    console.log('COULD NOT LOAD AUDIO');
    $('#NETWORKERROR').show();
  });

  audio.src = url;
  audio.load();
}

/* Start the game */
function startGame() {
  if (loaded < audioFiles.length) {
    preloadsounds();
  }

  if (track.length === 0) switchStartButton(2);
  track.push(Math.floor(Math.random() * (3 - 0 + 1)) + 0);
  document.getElementById('counter').innerText = track.length;
  document.getElementById('counter').style.color = '#bdbdbd';
  document.getElementById('title').innerText = 'Listen carefully';
  playSong(track);
}

function switchStartButton(toggle) {
  if (toggle === 2) {
    document.getElementById('btn-start').removeEventListener('click', startGame);
    document.getElementById('btn-start').addEventListener('click', restartGame);
    document.getElementById('btn-start').innerText = 'Restart';
  } else if (toggle === 1) {
    document.getElementById('btn-start').removeEventListener('click', restartGame);
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-start').innerText = 'Start';
  }
}

function restartGame() {
  track = [];
  userPlay = [];
  startGame();
}

/* change BG color */
function setBG(cell, delay) {
  setTimeout(function () {
    document.getElementById(cell).style.backgroundColor = colors[cell[3]];
  }, 200);
}

/* Play sound when user clicks  */
function playSound() {
  const id = this.id;
  userPlay.push(Number(id[3]));
  checkUser();
  document.getElementById(id).style.backgroundColor = '#fff';
  const audio = new Audio(audioFiles[Number(id[3])]);
  audio.play();
  setBG(id, 200);
}

/* Play sound generated by the algo */
function playSong(arr) {
  const speed = track.length < 5 ? 700 :
                track.length < 9 ? 600 :
                track.length < 13 ? 500 : 400;
  const run = setInterval(play, speed);
  let id = 0;

  function play() {
    if (id === arr.length) {
      clearInterval(run);
      userPlay = [];
      toggleEventListener(1);
      document.getElementById('title').innerText = 'Your turn..';
    } else {
      document.getElementById(`pad${arr[id]}`).style.backgroundColor = '#fff';
      const audio = new Audio(audioFiles[arr[id]]);
      audio.play();
      setBG(`pad${arr[id]}`, speed);
      id++;
    }
  }
}

/* check users click */
function checkUser() {
  const item = userPlay.length - 1;
  if (track[item] === userPlay[item]) {
    if (track.length === userPlay.length) {
      toggleEventListener(0);
      document.getElementById('title').innerText = 'correct';
      document.getElementById('title').style.backgroundColor = '#d4edda';
      document.getElementById('title').style.color = '#fff';
      if (track.length === wins) {
        playWin();
        return;
      }

      setTimeout(function () {
        startGame();
        document.getElementById('title').innerText = 'Listen carefully';
        document.getElementById('title').style.backgroundColor = '#fff';
        document.getElementById('title').style.color = '#bdbdbd';
      }, 1000
      );
    }
  } else {
    toggleEventListener(0);
    document.getElementById('title').innerText = 'wrong';
    document.getElementById('title').style.backgroundColor = '#f5c6cb';
    document.getElementById('title').style.color = '#fff';
    setTimeout(function () {
      if (document.getElementById('strict').checked === true) {
        restartGame();
      } else {
        playSong(track);
      }

      document.getElementById('title').innerText = 'Listen carefully';
      document.getElementById('title').style.backgroundColor = '#fff';
      document.getElementById('title').style.color = '#bdbdbd';
    }, 1000
    );
  }
}

/* Play winning sequence */
function playWin() {
  switchStartButton(1);
  document.getElementById('counter').innerText = 0;
  document.getElementById('counter').style.color = '#fff';
  track = [];
  userPlay = [];

  const run = setInterval(win, 300);
  let id = 0;
  const song = [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0];
  document.getElementById('overlay').style.display = 'flex';
  document.getElementById('overlay-text').innerHTML = `Simon congrats!!`;

  function win() {
    if (id === song.length) {
      clearInterval(run);
      document.getElementById('title').style.backgroundColor = '#fff';
      document.getElementById('title').style.color = '#bdbdbd';
      document.getElementById('title').innerText = 'Another round?';
      document.getElementById('overlay').style.display = 'none';
    } else {
      document.getElementById(`pad${song[id]}`).style.backgroundColor = '#fff';
      const audio = new Audio(audioFiles[song[id]]);
      audio.play();
      setBG(`pad${song[id]}`, 300);
      id++;
    }
  }
}
