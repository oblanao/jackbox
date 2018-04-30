const templateRules = {
  '#server-pregame-template': (roomCode) => {
    $('.text').text(`JOIN ${roomCode} to start playing`); 
  },
  '#client-pregame-template': (playerName) => {
    $('.greeting').text(`Hello, ${playerName} !`);
  },
  '#room-deleted': (roomCode) => {
    $('#room-roomcode').text(roomCode);
  },
  '#server-game_starting-template': (socket) => {
    // Adjust main-container. This is neccesary because if width and height is set for countdown, it is not centered
    $('.main-container').css({
      "width": "60vw",
      // Height is not neccesary
    });
    // Countdown options
    $(".startGame-countdown").TimeCircles({
      "count_past_zero": false,
      "fg_width": 0.05,
      "bg_width": 0.01,
      "time": {
        "Days": { "show": false },
        "Hours": { "show": false },
        "Minutes": { "show": false },
        "Seconds": { "show": true, "text": ""}
      }
    });
    // Countdown events for sounds
    let countdown = $(".startGame-countdown").TimeCircles();
    countdown.addListener(function(unit, value, total) {
    countdown.start();
      if (total === 5) {
        var audio = new Audio('/sounds/5.ogg');
        audio.play();
      } else if (total === 4) {
        var audio = new Audio('/sounds/4.ogg');
        audio.play();
      } else if (total === 3) {
        var audio = new Audio('/sounds/3.ogg');
        audio.play();
      } else if (total === 2) {
        var audio = new Audio('/sounds/2.ogg');
        audio.play();
      } else if (total === 1) {
        var audio = new Audio('/sounds/1.ogg');
        audio.play();
        // Debug: countdown.stop();
      } else if (total <= 0) {
        setTimeout(() => {
          var audio = new Audio('/sounds/begin.ogg');
          audio.play();
          countdown.end().fadeOut();
          // Emit start-game event
          socket.emit('game-start', App.roomCode);
        },750);
      }
  });
  } 
}