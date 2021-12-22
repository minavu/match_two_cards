let game_board = document.getElementById("game-board");
let WINNING_SCORE = 16;

function changeGrid(size) {
    let grids = ["grid-4x4", "grid-6x6"];
    WINNING_SCORE = size * size;
    game_board.classList.remove(...grids);
    game_board.classList.add(`grid-${size}x${size}`);
    resetGame(size);
}

function resetGame(size) {
    document.querySelectorAll(".game-card").forEach(card => card.remove());
    document.getElementById("score").innerHTML = "000";
    document.getElementById("time").innerHTML = '<span id="minutes">00</span>:<span id="seconds">00</span>.<span id="tenths">00</span>';
    document.getElementById("moves").innerHTML = "000";
    let pause_play = document.getElementById("pause-play");
    pause_play.setAttribute("disabled", true);
    pause_play.innerHTML = "PAUSE";
    pause_play.classList.replace("play", "pause");
    document.getElementById("reset").setAttribute("disabled", true);
    fetchCards(size);
    stopWatch(size);
}

function fetchCards(size = 4) {
    fetch(`https://deckofcardsapi.com/api/deck/new/draw/?count=${size*size/2}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            let {cards} = data;
            let cards_twice = [...cards, ...cards];
            fisherYatesShuffle(cards_twice);
            cards_twice.forEach((card, index) => {
                let card_container = document.createElement("div");
                card_container.setAttribute("class", `id-${index} game-card game-card-container game-card-${size}x${size}`);

                let card_flipper = document.createElement("div");
                card_flipper.setAttribute("class", `id-${index} game-card-flipper game-card-${size}x${size}`);

                let card_placer = document.createElement("img");
                card_placer.setAttribute("src", "./joker.png");
                card_placer.setAttribute("alt", "back image of card");
                card_placer.setAttribute("class", `id-${index} game-card-placer game-card-${size}x${size}`);
                
                let card_back_image = document.createElement("img");
                card_back_image.setAttribute("src", "./joker.png");
                card_back_image.setAttribute("alt", "back image of card");
                card_back_image.setAttribute("class", `id-${index} game-card-back game-card-${size}x${size}`);
                card_back_image.setAttribute("onclick", "flip(event);");

                let card_front_image = document.createElement("img");
                card_front_image.setAttribute("src", card.image);
                card_front_image.setAttribute("alt", card.code);
                card_front_image.setAttribute("name", card.code);
                card_front_image.setAttribute("class", `id-${index} game-card-front game-card-${size}x${size}`);

                card_container.append(card_flipper);
                card_flipper.append(card_placer);
                card_flipper.append(card_back_image);
                card_flipper.append(card_front_image);
                game_board.append(card_container);
            })
        })
        .catch(error => {
            console.error("Request failed", error)
        })
    ;
}

function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[j], array[i]] = [array[i], array[j]];
    }
}

function flip(event) {
    let moves = document.getElementById("moves").innerHTML;
    moves = String(Number(moves) + 1);
    document.getElementById("moves").innerHTML = moves.padStart(3, "0");

    let id = event.target.classList[0];
    let flip = document.querySelector(`.${id}.game-card-flipper`);
    flip.style.transform = "rotateY(180deg)";
    flip.classList.add("flipped-card");

    let all_flipped = document.querySelectorAll(".flipped-card");
    if (all_flipped.length === 2) setTimeout(checkMatch, 1000, all_flipped);
}

function checkMatch(all_flipped) {
    let cards = [];
    all_flipped.forEach(card => {
        let {lastChild} = card;
        cards.push(lastChild.name);
    });
    if (cards[0] === cards[1]) {
        alert("MATCH");
        all_flipped.forEach(card => {
            card.classList.remove("flipped-card");
            card.classList.add("matched-card");
        });
        let score = document.getElementById("score").innerHTML;
        score = String(Number(score) + 2);
        document.getElementById("score").innerHTML = score.padStart(3, "0");
        if (Number(score) === WINNING_SCORE) youWin();
    } else {
        all_flipped.forEach(card => {
            card.classList.remove("flipped-card");
            card.style.transform = "rotateY(0deg)";
        });
    }
}

function youWin() {
    alert("YOU WIN!!!  CONGRATULATIONS!!!");
}

function stopWatch(size = 4) {
    let tens = 0;
    let secs = 0;
    let mins = 0;
    let tenths = document.getElementById("tenths");
    let seconds = document.getElementById("seconds");
    let minutes = document.getElementById("minutes");
    let pause_play = document.getElementById("pause-play");
    let reset = document.getElementById("reset");
    let interval = 0;

    const watch = () => {
        tens++;
        if (tens > 99) {
            secs++;
            tens = 0;
        }
        if (secs > 59) {
            mins++;
            secs = 0;
        }
        tenths.innerHTML = String(tens).padStart(2, "0");
        seconds.innerHTML = String(secs).padStart(2, "0");
        minutes.innerHTML = String(mins).padStart(2, "0");
    }

    const start = () => {
        interval = setInterval(watch, 10);
        document.removeEventListener("click", start, true);
        pause_play.removeAttribute("disabled");
        reset.removeAttribute("disabled");
    }

    const stop = () => {
        clearInterval(interval);
    }

    document.addEventListener("click", start, true);

    pause_play.onclick = () => {
        if (pause_play.classList.contains("pause")) {
            stop();
            pause_play.innerHTML = "PLAY";
            pause_play.classList.replace("pause", "play");
            document.querySelectorAll(".game-card-back").forEach(card => card.removeAttribute("onclick"));
        } else {
            start();
            pause_play.innerHTML = "PAUSE";
            pause_play.classList.replace("play", "pause");
            document.querySelectorAll(".game-card-back").forEach(card => card.setAttribute("onclick", "flip(event);"));
        }
    }

    reset.onclick = () => {
        stop();
        resetGame(size);
    }
}

fetchCards();
stopWatch();