


let currentRow = 0;
let nextRowBlock = 0;
let gameFin = 0;
let remNotification = 0;
let drunkle_answer;
let wordlist;
const drunkle_Start_date = new Date('2025-08-28')
const today_date = new Date()
let timeDifference = today_date - drunkle_Start_date;
let daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
let keyPressHandler;
let colors = new Set(["grey", "green", "yellow"])

let tileColor;
let colorState;

let container = document.createElement('div');
container.id = 'container';
document.body.append(container);


try {
  const response = await fetch('utils/drunkle.json');
  const drunkle_object = await response.json();
  wordlist = drunkle_object["words"];
} catch (error) {
  console.error("Failed to load JSON:", error);
}



function gameOver(game) {
  gameFin = 1;
  document.removeEventListener('keyup', keyPressHandler);

  document.addEventListener('keyup', function restartHandler(event) {
    if (event.key === 'Enter') {
      document.removeEventListener('keyup', restartHandler);
      game === 'drunkle' ? startDrunkle() : startAmnesiacle();
      drunkle_answer = getRandomWord();
    }
  });
}

function getRandomWord(){
    let randomIndex = Math.floor(Math.random()*wordlist.length);
    let randomWord = wordlist[randomIndex].toUpperCase();
    return randomWord

}

async function startDrunkle() {
  container.innerHTML = '';
  gameFin = 0;
  currentRow = 0;
  nextRowBlock = 0;
  remNotification = 0;

  let dailyIndex = daysDifference;
  drunkle_answer = wordlist[dailyIndex].toUpperCase();

  // --- Logo ---
  let logo = document.createElement('div');
  logo.className = 'logo';
  let domName = 'DRUNKLE';
  for (let i = 0; i < domName.length; i++) {
    let spanClass = (i % 2 === 0) ? 'logo_purple' : 'logo_green';
    let logoSpan = document.createElement('span');
    logoSpan.className = spanClass;
    logoSpan.innerText = domName[i];
    logo.append(logoSpan);
  }
  container.append(logo);

  // --- Nav bar ---
  let navBar = document.createElement('div');
  navBar.className = 'navigation_bar';
  let giveUpButton = document.createElement('button');
  giveUpButton.id = 'give_up_button';
  giveUpButton.innerText = 'Give Up';
  giveUpButton.addEventListener("click", function () {
    if (gameFin === 0) {
      notification.innerText = `The word was ${drunkle_answer}. \nPress Enter to play again.`;
      gameOver('drunkle');
    }
  });
  let amnesiacle = document.createElement('button');
  amnesiacle.id = 'amnesiacle';
  amnesiacle.innerText = 'Play Amnesiacle';
  amnesiacle.addEventListener("click", function () {
    document.removeEventListener('keyup', keyPressHandler);
    startAmnesiacle();
  });
  let randomWord = document.createElement('button');
  randomWord.id = 'randomWord';
  randomWord.innerText = 'randomize word';
  randomWord.addEventListener("click", function() {
    drunkle_answer = getRandomWord();
  })
  navBar.append(giveUpButton);
  navBar.append(amnesiacle)
  navBar.append(randomWord);
  container.append(navBar);

  // --- Game area ---
  let gameArea = document.createElement('div');
  gameArea.className = 'game_area';
  for (let i = 0; i < 10; i++) {
    let row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < 5; j++) {
      let rowBlock = document.createElement('div');
      rowBlock.className = 'row_block';
      row.append(rowBlock);
    }
    gameArea.append(row);
  }
  container.append(gameArea);

  // --- Notification ---
  let notification = document.createElement('div');
  notification.id = 'notification';
  notification.innerText = 'May luck be on your side!';
  container.append(notification);

  // --- Keyboard ---
  let keyboard = document.createElement('div');
  keyboard.id = 'keyboard';
  

  function addKeys(el, layout, keyClass) {
    for (let i = 0; i < layout.length; i++) {
      let letter = layout[i];
      let key = document.createElement('span');
      key.className = keyClass;
      key.id = 'keyboard_' + letter;
      key.innerText = letter;
      key.dataset.state = "none";
      key.addEventListener("click", function () {
        if (gameFin === 0) {
          let wordRow = document.getElementsByClassName('row')[currentRow];
          addLetter(wordRow.childNodes, letter);
        }
      });
      el.append(key);
    }
  }

 let topKeys = document.createElement('div');
  topKeys.id = 'top_keys';
  addKeys(topKeys, 'QWERTYUIOP', 'keyboardKey_s');
  keyboard.append(topKeys);

  let midKeys = document.createElement('div');
  midKeys.id = 'mid_keys';
  addKeys(midKeys, 'ASDFGHJKL', 'keyboardKey_m');
  keyboard.append(midKeys);

  let botKeys = document.createElement('div');
  botKeys.id = 'bot_keys';
  let delKey = document.createElement('span');
  delKey.className = 'keyboardKey_l';
  delKey.innerHTML = '&#x2190;';
  delKey.addEventListener("click", function () {
    if (gameFin === 0) {
      let wordRow = document.getElementsByClassName('row')[currentRow];
      deleteLetter(wordRow.childNodes);
    }
  });
  botKeys.append(delKey);

  addKeys(botKeys, 'ZXCVBNM', 'keyboardKey_s');

  let enterKey = document.createElement('span');
  enterKey.className = 'keyboardKey_l';
  enterKey.innerText = 'Enter';
  enterKey.addEventListener("click", function () {
    if (gameFin === 0) {
      let wordRow = document.getElementsByClassName('row')[currentRow];
      submitWord(wordRow, notification);
    }
  });
  botKeys.append(enterKey);

  keyboard.append(botKeys);
  container.append(keyboard);

  // --- Event handling ---
  keyPressHandler = function handleKeyPress(event) {
    if (gameFin) return;
    let wordRow = document.getElementsByClassName('row')[currentRow];
    
    if (/^[a-zA-Z]$/.test(event.key)) {
      addLetter(wordRow.childNodes, event.key.toUpperCase());
    } else if (event.key === 'Enter') {
      submitWord(wordRow, notification);
    } else if (event.key === 'Backspace') {
      deleteLetter(wordRow.childNodes);
    }
  }
  
  document.addEventListener('keyup', keyPressHandler);

  // --- Game Logic ---
  function addLetter(rowBlockEl, letter) {
    if (remNotification === 0) {
      remNotification = 1;
      notification.innerText = '';
    }
    if (nextRowBlock < 5) {
      rowBlockEl[nextRowBlock].innerText = letter;
      nextRowBlock++;
    }
  }

  function deleteLetter(rowBlockEl) {
    if (nextRowBlock > 0) {
      nextRowBlock--;
      rowBlockEl[nextRowBlock].innerText = '';
    }
  }

  function evaluateGuess(word, answer) {
    let result = Array(word.length).fill("grey");
    let answerArr = answer.split("");
    let used = Array(answer.length).fill(false);

    // Pass 1: greens
    for (let i = 0; i < word.length; i++) {
      if (word[i] === answerArr[i]) {
        result[i] = "green";
        used[i] = true;
      }
    }

    // Pass 2: yellows
    for (let i = 0; i < word.length; i++) {
      if (result[i] === "grey") {
        let idx = answerArr.findIndex((ch, j) => ch === word[i] && !used[j]);
        if (idx !== -1) {
          result[i] = "yellow";
          used[idx] = true;
        }
      }
    }

    for (let i =0; i <result.length; i++){
      if (Math.random() <0.1){
        // console.log(result[i]);
        result[i] = Array.from(colors.difference(new Set([result[i]])))[Math.floor(Math.random()*2)];
        // console.log(result[i]);

      }
    }

    return result;
  }

  function updateKeyboard(letter, state) {
    let key = document.getElementById('keyboard_' + letter);
    if (!key) return;
    const priority = { "none": 0, "grey": 1, "yellow": 2, "green": 3 };
    let current = key.dataset.state || "none";
    if (priority[state] > priority[current]) {
      key.dataset.state = state;
      key.className = key.className.replace(/block(Grey|Gold|Green)/g, '').trim();
      key.classList.add(
        state === "green" ? "blockGreen" :
        state === "yellow" ? "blockGold" : "blockGrey"
      );
    }
  }

  function submitWord(wordRow, notification) {
    if (nextRowBlock < 5) {
      notification.innerText = "You must enter 5 characters";
      return;
    }

    let word = wordRow.innerText.replace(/[\n\r]/g, '');
    if (!wordlist.includes(word.toLowerCase())) {
      notification.innerText = "Word not in list";
      return;
    }

    let result = evaluateGuess(word.split(""), drunkle_answer);

    for (let i = 0; i < result.length; i++) {
      let state = result[i];
      wordRow.childNodes[i].className = 'row_block ' +
        (state === "green" ? "blockGreen" :
          state === "yellow" ? "blockGold" : "blockGrey");
      updateKeyboard(word[i], state);
    }

    if (word === drunkle_answer) {
      notification.innerText = "Well done, you won! Enter to play again";
      gameOver(drunkle);
    } else if (currentRow === 9) {
      notification.innerText = `You lost. The word was ${drunkle_answer}. Press Enter to play again.`;
      gameOver(drunkle);
    } else {
      currentRow++;
      nextRowBlock = 0;
    }
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace') {
      e.preventDefault(); // prevent browser back navigation
    }
  });
}


async function startAmnesiacle(){
  container.innerHTML = '';
  gameFin = 0;
  currentRow = 0;
  nextRowBlock = 0;
  remNotification = 0;

  const randomIndex = daysDifference;
  drunkle_answer = wordlist[randomIndex].toUpperCase();

  // --- Logo ---
  let logo = document.createElement('div');
  logo.className = 'logo';
  let domName = 'AMNESIACLE';
  for (let i = 0; i < domName.length; i++) {
    let spanClass = (i % 2 === 0) ? 'logo_purple' : 'logo_green';
    let logoSpan = document.createElement('span');
    logoSpan.className = spanClass;
    logoSpan.innerText = domName[i];
    logo.append(logoSpan);
  }
  container.append(logo);

  // --- Nav bar ---
  let navBar = document.createElement('div');
  navBar.className = 'navigation_bar';
  let giveUpButton = document.createElement('button');
  giveUpButton.id = 'give_up_button';
  giveUpButton.innerText = 'Give Up';
  giveUpButton.addEventListener("click", function () {
    if (gameFin === 0) {
      notification.innerText = `The word was ${drunkle_answer}. \nPress Enter to play again.`;
      gameOver('amnesiac');
    }
  });
  let drunkle = document.createElement('button');
  drunkle.id = 'drunkle';
  drunkle.innerText = 'Play Drunkle';
  drunkle.addEventListener("click", function () {
    document.removeEventListener('keyup', keyPressHandler);
    startDrunkle();
  });
  let randomWord = document.createElement('button');
  randomWord.id = 'randomWord';
  randomWord.innerText = 'randomize word';
  randomWord.addEventListener("click", function() {
    drunkle_answer = getRandomWord();
  })

  navBar.append(giveUpButton);
  navBar.append(drunkle)
  navBar.append(randomWord);
  container.append(navBar);

  // --- Game area ---
  let gameArea = document.createElement('div');
  gameArea.className = 'game_area';
  let row = document.createElement('div');
  row.className = 'row';
  for (let i = 0; i < 5; i++) {
    let rowBlock = document.createElement('div');
    rowBlock.className = 'row_block';
    row.append(rowBlock);
  gameArea.append(row);
  }
  container.append(gameArea);

  // --- Notification ---
  let notification = document.createElement('div');
  notification.id = 'notification';
  notification.innerText = 'Do you remember!';
  container.append(notification);

  // --- Keyboard ---
  let keyboard = document.createElement('div');
  keyboard.id = 'keyboard';
  

  function addKeys(el, layout, keyClass) {
    for (let i = 0; i < layout.length; i++) {
      let letter = layout[i];
      let key = document.createElement('span');
      key.className = keyClass;
      key.id = 'keyboard_' + letter;
      key.innerText = letter;
      key.dataset.state = "none";
      key.addEventListener("click", function () {
        if (gameFin === 0) {
          let wordRow = document.getElementsByClassName('row')[currentRow];
          addLetter(wordRow.childNodes, letter);
        }
      });
      el.append(key);
    }
  }

 let topKeys = document.createElement('div');
  topKeys.id = 'top_keys';
  addKeys(topKeys, 'QWERTYUIOP', 'keyboardKey_s');
  keyboard.append(topKeys);

  let midKeys = document.createElement('div');
  midKeys.id = 'mid_keys';
  addKeys(midKeys, 'ASDFGHJKL', 'keyboardKey_m');
  keyboard.append(midKeys);

  let botKeys = document.createElement('div');
  botKeys.id = 'bot_keys';
  let delKey = document.createElement('span');
  delKey.className = 'keyboardKey_l';
  delKey.innerHTML = '&#x2190;';
  delKey.addEventListener("click", function () {
    if (gameFin === 0) {
      let wordRow = document.getElementsByClassName('row')[currentRow];
      deleteLetter(wordRow.childNodes);
    }
  });
  botKeys.append(delKey);

  addKeys(botKeys, 'ZXCVBNM', 'keyboardKey_s');

  let enterKey = document.createElement('span');
  enterKey.className = 'keyboardKey_l';
  enterKey.innerText = 'Enter';
  enterKey.addEventListener("click", function () {
    if (gameFin === 0) {
      let wordRow = document.getElementsByClassName('row')[currentRow];
      submitWord(wordRow, notification);
    }
  });
  botKeys.append(enterKey);

  keyboard.append(botKeys);
  container.append(keyboard);

  // --- Event handling ---
  keyPressHandler = function handleKeyPress(event) {
    if (gameFin) return;
    let wordRow = document.getElementsByClassName('row')[currentRow];
    
    if (/^[a-zA-Z]$/.test(event.key)) {
      addLetter(wordRow.childNodes, event.key.toUpperCase());
    } else if (event.key === 'Enter') {
      submitWord(wordRow, notification);
    } else if (event.key === 'Backspace') {
      deleteLetter(wordRow.childNodes);
    }
  }
  
  document.addEventListener('keyup', keyPressHandler);

  // --- Game Logic ---
  function addLetter(rowBlockEl, letter) {
    if (remNotification === 0) {
      remNotification = 1;
      notification.innerText = '';
    }
    if (nextRowBlock < 5) {
      rowBlockEl[nextRowBlock].innerText = letter;
      nextRowBlock++;
    }
  }

  function deleteLetter(rowBlockEl) {
    if (nextRowBlock > 0) {
      nextRowBlock--;
      rowBlockEl[nextRowBlock].innerText = '';
    }
  }

  function evaluateGuess(word, answer) {
    let result = Array(word.length).fill("grey");
    let answerArr = answer.split("");
    let used = Array(answer.length).fill(false);

    // Pass 1: greens
    for (let i = 0; i < word.length; i++) {
      if (word[i] === answerArr[i]) {
        result[i] = "green";
        used[i] = true;
      }
    }

    // Pass 2: yellows
    for (let i = 0; i < word.length; i++) {
      if (result[i] === "grey") {
        let idx = answerArr.findIndex((ch, j) => ch === word[i] && !used[j]);
        if (idx !== -1) {
          result[i] = "yellow";
          used[idx] = true;
        }
      }
    }

    return result;
  }

  function revealTile(tile, resultClass, delay) {
    setTimeout(() => {
      tile.classList.add("flip");
      // Change background at halfway point (300ms of 600ms)
      setTimeout(() => {
        tile.classList.add(resultClass); 
      }, 300);

      setTimeout(() => {
        tile.classList.remove("blockGreen");
        tile.classList.remove("blockGold");
        tile.classList.remove("blockGrey");
      }, 600)

      // Remove animation class after it runs (so it can be reused)
      tile.addEventListener("animationend", () => {
        tile.classList.remove("flip");
        tile.classList.add("amnesiac");
        if (!(tile.classList.contains('keyboardKey_s') || tile.classList.contains('keyboardKey_m') || tile.classList.contains('keyboardKey_l'))){
          tile.innerHTML = '';
        }
      }, { once: true });
    }, delay);
  }
  function updateKeyboard(letter, state) {
    let key = document.getElementById('keyboard_' + letter);
    if (!key) return;
    const priority = { "none": 0, "grey": 1, "yellow": 2, "green": 3 };
    let current = key.dataset.state || "none";
    if (priority[state] > priority[current]) {
      key.dataset.state = state;
      key.className = key.className.replace(/block(Grey|Gold|Green)/g, '').trim();
      tileColor = state === "green" ? "blockGreen" :
      tileColor = state === "yellow" ? "blockGold" : "blockGrey"
      revealTile(key, tileColor, 100)
    }
  }

  function submitWord(wordRow, notification) {
    if (nextRowBlock < 5) {
      notification.innerText = "You must enter 5 characters";
      return;
    }

    let word = wordRow.innerText.replace(/[\n\r]/g, '');
    if (!wordlist.includes(word.toLowerCase())) {
      notification.innerText = "Word not in list";
      return;
    }

    let result = evaluateGuess(word.split(""), drunkle_answer);

    for (let i = 0; i < result.length; i++) {
      let state = result[i];
      wordRow.childNodes[i].classList.add('row_block')
      colorState = state === "green" ? "blockGreen" : 
      colorState = state === "yellow" ? "blockGold" : "blockGrey";
      updateKeyboard(word[i], state);
      revealTile(wordRow.childNodes[i], colorState, 300*i)

    }

    if (word === drunkle_answer) {
      notification.innerText = "Well done, you won! Enter to play again";
      gameOver('amnesiac');
    } else {
      nextRowBlock = 0;
    }
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace') {
      e.preventDefault(); // prevent browser back navigation
    }
  });
}


startDrunkle();
