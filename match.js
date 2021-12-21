let game_board = document.getElementById("game-board");
let timer = 0;
let WINNING_SCORE = 16;

function changeGrid(size) {
    let grids = ["grid-4x4", "grid-6x6"];
    WINNING_SCORE = size * size;
    game_board.classList.remove(...grids);
    game_board.classList.add(`grid-${size}x${size}`);
    document.querySelectorAll(".game-card").forEach(card => card.remove());
    document.getElementById("score").innerHTML = "000";
    document.getElementById("time").innerHTML = "00:00";
    document.getElementById("moves").innerHTML = "000";
    fetchCards(size);
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
        if (Number(score) === WINNING_SCORE) alert("YOU WIN!!!  CONGRATULATIONS!!!");
    } else {
        all_flipped.forEach(card => {
            card.classList.remove("flipped-card");
            card.style.transform = "rotateY(0deg)";
        });
    }
}

// timer = setInterval(() => {
//     let time = document.getElementById("time").innerHTML;
//     time = time.split(":");
//     String(Number(time[1])++).padStart(2, "0");
//     time = time.join(":");
//     console.log(time);
// }, 1000);

fetchCards();