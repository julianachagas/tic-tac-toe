'use strict';

class Player {
  constructor(name, mark) {
    this.playerName = name;
    this.mark = mark;
    this.wins = 0;
  }
}

let game = {
  gameChoice: '', // playerVsCpu or player1VsPlayer2
  gameboard: new Array(9).fill(''),
  currentPlayer: 'x',
  players: [],
  ties: 0,
  round: 1
};

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const storeGame = () => {
  localStorage.setItem('tictactoe', JSON.stringify(game));
};

const getStoredGame = () => {
  return JSON.parse(localStorage.getItem('tictactoe'));
};

const renderGameboard = () => {
  game.gameboard.forEach((item, index) => {
    if (item !== '') {
      const element = document.querySelector(`[data-position="${index}"]`);
      element.firstElementChild.src = `assets/${item}-mark.svg`;
      element.firstElementChild.classList.remove('hidden');
    }
  });
};

const renderScoreBoard = () => {
  game.players.forEach(player => {
    document.querySelector(`.${player.mark}-score .score`).textContent =
      player.wins;
  });
  document.querySelector(`.ties .score`).textContent = game.ties;
};

const resetGameboard = () => {
  game.gameboard = new Array(9).fill('');
  const marks = document.querySelectorAll('.player-mark');
  marks.forEach(mark => {
    mark.src = '';
    mark.classList.add('hidden');
    mark.parentElement.classList.remove('highlight-x', 'highlight-o');
  });
};

const resetScoreboard = () => {
  const scores = document.querySelectorAll('.score');
  scores.forEach(score => (score.textContent = 0));
};

const displayStoredGame = () => {
  if (getStoredGame()) {
    displayGameScreen();
    game = getStoredGame();
    renderGameboard();
    displayCurrentTurn();
    renderScoreBoard();
    document.querySelector('.o-score').firstElementChild.textContent =
      game.gameChoice === 'player1VsPlayer2' ? 'O (P2)' : 'O (CPU)';
    if (game.currentPlayer === 'o' && game.gameChoice === 'playerVsCpu') {
      setTimeout(() => {
        computerMove();
        const isGameOver = checkResult();
        if (!isGameOver) {
          switchPlayer();
        }
      }, 600);
    }
  }
};

const handleGameChoice = e => {
  // save gameChoice
  game.gameChoice = e.target.id;
  // display player2 input only if user selected player1VsPlayer2
  document
    .querySelector('.player2-input')
    .classList.toggle('hidden', e.target.id === 'playerVsCpu');
  // display players names form
  document.querySelector('#players-names').classList.remove('hidden-transform');
};

const highlightResult = (...indexes) => {
  indexes.forEach(index => {
    const element = document.querySelector(`[data-position="${index}"]`);
    element.classList.add(`highlight-${game.currentPlayer}`);
    element.firstElementChild.src = `assets/${game.currentPlayer}-mark-blue.svg`;
  });
};

const checkWinner = () => {
  for (let combination of winningCombinations) {
    if (
      combination.every(item => game.gameboard[item] === game.currentPlayer)
    ) {
      highlightResult(...combination);
      return true;
    }
  }
  return false;
};

const newGame = () => {
  // display initial screen
  document.querySelector('.initial-screen').classList.remove('hidden');
  // hide form
  document.querySelector('#players-names').classList.add('hidden-transform');
  // hide game screen
  document.querySelector('.game').classList.add('hidden');
  // reset game object
  game.currentPlayer = 'x';
  game.gameChoice = '';
  game.players = [];
  game.ties = 0;
  game.round = 1;
  resetGameboard();
  resetScoreboard();
  displayCurrentTurn();
  localStorage.removeItem('tictactoe');
};

const restart = () => {
  resetGameboard();
  game.currentPlayer = 'x';
  // alternate first turn btw x and o when playing with 2 players
  // when round is an even number, first turn is "o"
  if (game.gameChoice === 'player1VsPlayer2' && game.round % 2 === 0) {
    game.currentPlayer = 'o';
  }
  displayCurrentTurn();
  storeGame();
};

const displayCurrentTurn = () => {
  const currentMark = document.querySelectorAll('.current-player-mark');
  currentMark.forEach(mark => {
    // hide mark if it's not the mark of the current player
    mark.classList.toggle(
      'hidden',
      mark.id !== `current-${game.currentPlayer}`
    );
  });
};

const showMarkOnMouseEnter = e => {
  const imgTag = e.target.querySelector(`.player-mark`);
  if (imgTag.classList.contains('hidden')) {
    imgTag.classList.remove('hidden');
    imgTag.src = `assets/${game.currentPlayer}-mark-outline.svg`;
  }
};

const hideMarkOnMouseLeave = e => {
  const imgTag = e.target.querySelector(`.player-mark`);
  if (
    imgTag.getAttribute('src') ===
    `assets/${game.currentPlayer}-mark-outline.svg`
  ) {
    imgTag.classList.add('hidden');
  }
};

const disableGameboard = () => {
  document
    .querySelector('.gameboard')
    .removeEventListener('click', manageGameboard);
  document.querySelectorAll('.space').forEach(button => {
    button.removeEventListener('mouseenter', showMarkOnMouseEnter);
    button.removeEventListener('mouseleave', hideMarkOnMouseLeave);
  });
};

const enableGameboard = () => {
  document.querySelectorAll('.space').forEach(button => {
    button.addEventListener('mouseenter', showMarkOnMouseEnter);
    button.addEventListener('mouseleave', hideMarkOnMouseLeave);
  });
  document
    .querySelector('.gameboard')
    .addEventListener('click', manageGameboard);
};

const newRound = () => {
  game.round++;
  restart();
  enableGameboard();
};

const displayModal = winner => {
  const resultModal = document.querySelector('#result-modal');
  resultModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const message = resultModal.querySelector('.result-message');
  if (winner) {
    const { playerName } = winner;
    if (playerName !== 'CPU') {
      message.textContent = `${playerName} wins!`;
      message.classList.add(`player-${winner.mark}`);
    } else {
      resultModal.querySelector('.congrats-message').classList.add('hidden');
      message.textContent = `Oh no, you lost :(`;
    }
  } else {
    resultModal.querySelector('.congrats-message').classList.add('hidden');
    message.textContent = `It's a tie!`;
  }
};

const endGame = (status = 'win') => {
  let winner = null;
  if (status === 'tie') {
    game.ties++;
  } else {
    winner = game.players.find(player => player.mark === game.currentPlayer);
    winner.wins++;
  }
  renderScoreBoard();
  disableGameboard();
  setTimeout(() => displayModal(winner), 1000);
};

const checkResult = () => {
  // check if there's a winner
  const isThereAWinner = checkWinner();
  if (isThereAWinner) {
    endGame();
    return isThereAWinner;
  }

  // check for tie
  if (!game.gameboard.includes('')) {
    endGame('tie');
    return true;
  }

  // return false to continue the game
  return isThereAWinner;
};

const switchPlayer = () => {
  game.currentPlayer = game.currentPlayer === 'x' ? 'o' : 'x';
  displayCurrentTurn();
  storeGame();
};

const playerMove = button => {
  const index = button.dataset.position;
  if (game.gameboard[index] === '') {
    // update gameboard array and display
    game.gameboard[index] = game.currentPlayer;
    renderGameboard();
    return true;
  }
};

const getWinningMove = array => {
  let winningMove = null;
  // loop through the winning combinations
  for (let combination of winningCombinations) {
    let matches = 0;
    // loop through the indexes occupied by the player x or o
    array.forEach(index => {
      // it's a match if the current index is present in the current combination
      if (combination.includes(index)) {
        matches++;
        // if two indexes with the same player are present in the combination, the player is about to win
        if (matches === 2) {
          // find the move that will win the game: the other index in the combination not occupied yet by the player
          const missingMove = combination.find(item => !array.includes(item));
          // check if this index is empty in the gameboard
          if (game.gameboard[missingMove] === '') {
            winningMove = missingMove;
          }
        }
      }
    });
  }
  return winningMove;
};

const getBestMove = () => {
  // get the indexes occupied by player x
  const playerXIndexes = game.gameboard
    .map((item, index) => {
      return item === 'x' ? index : item;
    })
    .filter(item => item !== 'o' && item !== '');
  // get the indexes occupied by player o
  const playerOIndexes = game.gameboard
    .map((item, index) => {
      return item === 'o' ? index : item;
    })
    .filter(item => item !== 'x' && item !== '');

  //  get the index of the winning move if CPU can win the game in this turn
  const cpuWin = getWinningMove(playerOIndexes);
  // get the index where player X can win, CPU can stop player X
  const stopXplayer = getWinningMove(playerXIndexes);
  return cpuWin ?? stopXplayer;
};

const computerMove = () => {
  // get random index, between 0 and 9
  let index;
  do {
    index = Math.floor(Math.random() * (9 - 0 + 1));
  } while (game.gameboard[index] !== '');
  // get best move
  const bestMove = getBestMove();
  // if a best move was found, index will be the bestMove, otherwise (bestMove === null) it'll continue to be the random index
  index = bestMove ?? index;
  game.gameboard[index] = game.currentPlayer;
  renderGameboard();
};

const playerTurn = button => {
  const isMoveValid = playerMove(button);
  if (isMoveValid) {
    const isGameOver = checkResult();
    if (!isGameOver) {
      switchPlayer();
    }
  }
};

const onePlayerGame = button => {
  playerTurn(button);
  if (game.currentPlayer === 'o') {
    disableGameboard();
    setTimeout(() => {
      computerMove();
      const isGameOver = checkResult();
      if (!isGameOver) {
        switchPlayer();
        enableGameboard();
      }
    }, 600);
  }
};

const manageGameboard = e => {
  const target = e.target.closest('.space');
  if (target) {
    if (game.gameChoice === 'playerVsCpu') {
      onePlayerGame(target);
      return;
    }
    playerTurn(target);
  }
};

const displayGameScreen = () => {
  // hide initial screen
  document.querySelector('.initial-screen').classList.add('hidden');
  // show game screen
  document.querySelector('.game').classList.remove('hidden');
  // scroll to top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // add event listener to the gameboard
  enableGameboard();
};

const noNameEntered = () => {
  //show feedback
  document.querySelector('.form-feedback').classList.remove('hidden');
  setTimeout(
    () => document.querySelector('.form-feedback').classList.add('hidden'),
    2000
  );
};

const getPlayersAndDisplayGame = e => {
  const players = [];
  const player1Name = e.target.querySelector('#player1-name').value.trim();
  let player2Name;
  if (game.gameChoice === 'player1VsPlayer2') {
    player2Name = e.target.querySelector('#player2-name').value.trim();
  }
  if (player1Name === '' || player2Name === '') {
    noNameEntered();
    return;
  }
  // if player2Name is undefined, the user is playing against the computer
  player2Name = player2Name || 'CPU';
  const player1 = new Player(player1Name, 'x');
  const player2 = new Player(player2Name, 'o');
  players.push(player1, player2);
  document.querySelector('.o-score').firstElementChild.textContent =
    game.gameChoice === 'player1VsPlayer2' ? 'O (P2)' : 'O (CPU)';
  game.players = players;
  displayGameScreen();
  e.target.reset();
};

const closeAndResetModal = () => {
  // hide modal
  document.querySelector('#result-modal').classList.add('hidden');
  // reset body overflow property
  document.body.style.overflow = 'auto';
  // reset result message
  document.querySelector('.congrats-message').classList.remove('hidden');
  document.querySelector('.result-message').textContent = '';
  document
    .querySelector('.result-message')
    .classList.remove('player-x', 'player-o');
};

const handleModalButtons = e => {
  if (!e.target.classList.contains('btn')) return;
  closeAndResetModal();
  if (e.target.id === 'quit') {
    newGame();
  } else {
    newRound();
  }
};

// Event Listeners
// display the game stored in local storage
document.addEventListener('DOMContentLoaded', displayStoredGame);

// game choice
document
  .querySelector('#playerVsCpu')
  .addEventListener('click', handleGameChoice);
document
  .querySelector('#player1VsPlayer2')
  .addEventListener('click', handleGameChoice);

// players names
document.querySelector('#players-names').addEventListener('submit', e => {
  e.preventDefault();
  getPlayersAndDisplayGame(e);
});

// restart and new game buttons
document.querySelector('#restart').addEventListener('click', restart);
document.querySelector('#new-game').addEventListener('click', newGame);

// add event listener to the modal buttons
document
  .querySelector('.modal-buttons')
  .addEventListener('click', handleModalButtons);
