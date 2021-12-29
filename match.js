let game_board = document.getElementById("game-board");
let INTERVAL = 0;
let DEFAULT_DECK = "playing";
let DEFAULT_SIZE = 2;
let WINNING_SCORE = DEFAULT_SIZE * DEFAULT_SIZE;
let curr_grid_row = DEFAULT_SIZE;
let curr_grid_col = DEFAULT_SIZE;
let curr_deck = DEFAULT_DECK;
let playing_saved_list = [];
let pokemon_saved_list = [];
let movie_saved_list = [];
let movie_images_config;

function changeGrid(size_r, size_c) {
    curr_grid_row = size_r;
    curr_grid_col = size_c;
    let grids = [
        "grid-2x2",
        "grid-2x3", 
        "grid-2x4",
        "grid-3x2",
        "grid-3x4", 
        "grid-3x6", 
        "grid-4x2", 
        "grid-4x3",
        "grid-4x4", 
        "grid-4x5", 
        "grid-4x6", 
        "grid-4x8"
    ];
    game_board.classList.remove(...grids);
    game_board.classList.add(`grid-${curr_grid_row}x${curr_grid_col}`);
    WINNING_SCORE = curr_grid_row * curr_grid_col;
    resetGame();
}

function changeDeck(deck) {
    curr_deck = deck;
    resetGame();
}

function resetGame() {
    document.querySelectorAll(".game-card").forEach(card => card.remove());
    document.getElementById("score").innerHTML = "000";
    document.getElementById("time").innerHTML = '<span id="minutes">00</span>:<span id="seconds">00</span>.<span id="tenths">00</span>';
    document.getElementById("moves").innerHTML = "000";
    let pause_play = document.getElementById("pause-play");
    pause_play.setAttribute("disabled", true);
    pause_play.innerHTML = "PAUSE";
    pause_play.classList.replace("play", "pause");
    document.getElementById("reset").setAttribute("disabled", true);
    fetchCards();
}

function fetchPlayingData() {
    fetch(`https://deckofcardsapi.com/api/deck/new/draw/?count=52`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            let {cards} = data;
            cards.forEach(result => {
                let card = {
                    id: result.code,
                    title: result.value + " of " + result.suit,
                    image: result.image
                }
                playing_saved_list.push(card);
            })
        })
        .catch(error => {
            console.error("Request failed", error)
        })
    ;
}

function fetchPokemonData() {
    fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:dp1&pageSize=100`, {
            method: "GET",
            headers: {
                "X-Api-Key": "66fc5e9e-c1e7-4ebe-8b04-d30a2734cf4c",
            }
        })
        .then(response => {
            return response.json();
        })
        .then(response => {
            let {data} = response;
            data.forEach(result => {
                let pokemon = {
                    id: result.id,
                    title: result.name,
                    image: result.images.small
                }
                pokemon_saved_list.push(pokemon);
            })
        })
        .catch(error => {
            console.error("Request failed", error)
        })
    ;
}

function fetchMovieData() {
    let movie_api_key = "5941d4436aff4a93f3f11e86cb336bec";
    fetch(`https://api.themoviedb.org/3/configuration?api_key=${movie_api_key}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            movie_images_config = {...data};
            getMovies();
            return data;
        })
        .catch(error => {
            console.error(error);
        })
    ;
    const getMovies = () => {
        for (let i = 1; i <= 2; i++) {
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${movie_api_key}&language=en-US&page=${i}`)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    let {results} = data;
                    results.forEach(result => {
                        let movie = {
                            id: result.id,
                            title: result.title,
                            image: movie_images_config.images.secure_base_url + movie_images_config.images.poster_sizes[3] + result.poster_path,
                        }
                        movie_saved_list.push(movie);
                    })
                    return data;
                })
                .catch(error => {
                    console.error(error);
                })
            ;
        }
    }
}

function fetchCards() {
    let cards;
    let back_image;
    switch (curr_deck) {
        case "playing":
            fisherYatesShuffle(playing_saved_list);
            cards = playing_saved_list.slice(0, curr_grid_row*curr_grid_col/2);
            back_image = "./images/joker.png";
            break;
        case "pokemon":
            fisherYatesShuffle(pokemon_saved_list);
            cards = pokemon_saved_list.slice(0, curr_grid_row*curr_grid_col/2);
            back_image = "./images/pokemon.png";
            break;
        case "movie":
            fisherYatesShuffle(movie_saved_list);
            cards = movie_saved_list.slice(0, curr_grid_row*curr_grid_col/2);
            back_image = "./images/movie.png";
            break;
        default:
            console.log(`An unexpected error occurred.  Current deck is ${curr_deck}`);
    }
    let cards_twice = [...cards, ...cards];
    fisherYatesShuffle(cards_twice);
    cards_twice.forEach((card, index) => {
        let card_container = document.createElement("div");
        card_container.setAttribute("class", `id-${index} game-card game-card-container game-card-${curr_grid_row}x${curr_grid_col}`);

        let card_flipper = document.createElement("div");
        card_flipper.setAttribute("class", `id-${index} game-card-flipper game-card-${curr_grid_row}x${curr_grid_col}`);

        let card_placer = document.createElement("img");
        card_placer.setAttribute("src", back_image);
        card_placer.setAttribute("alt", "back image of card");
        card_placer.setAttribute("class", `id-${index} game-card-placer game-card-${curr_grid_row}x${curr_grid_col}`);
        
        let card_back_image = document.createElement("img");
        card_back_image.setAttribute("src", back_image);
        card_back_image.setAttribute("alt", "back image of card");
        card_back_image.setAttribute("class", `id-${index} game-card-back game-card-${curr_grid_row}x${curr_grid_col}`);
        card_back_image.setAttribute("onclick", `flip(event);`);

        let card_front_image = document.createElement("img");
        card_front_image.setAttribute("src", card.image);
        card_front_image.setAttribute("alt", card.title);
        card_front_image.setAttribute("name", card.id);
        card_front_image.setAttribute("class", `id-${index} game-card-front game-card-${curr_grid_row}x${curr_grid_col}`);

        card_container.append(card_flipper);
        card_flipper.append(card_placer);
        card_flipper.append(card_back_image);
        card_flipper.append(card_front_image);
        game_board.append(card_container);
    })
    stopWatch();
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
    if (all_flipped.length === 2) {
        setTimeout(checkMatch, 1000, all_flipped);
        document.querySelectorAll(".game-card-back").forEach(card => card.removeAttribute("onclick"));
        setTimeout(() => document.querySelectorAll(".game-card-back").forEach(card => card.setAttribute("onclick", `flip(event);`)), 1000);
    }
    
}

function checkMatch(all_flipped) {
    let cards = [];
    all_flipped.forEach(card => {
        let {lastChild} = card;
        cards.push(lastChild.name);
    });
    if (cards[0] === cards[1]) {
        all_flipped.forEach(card => {
            card.classList.replace("flipped-card", "matched-card");
            card.classList.add("match-effect-spin");
            card.children[1].classList.add("match-effect-fadeout");
            card.children[2].classList.add("match-effect-fadeout");
        });
        let score = document.getElementById("score").innerHTML;
        score = String(Number(score) + 2);
        document.getElementById("score").innerHTML = score.padStart(3, "0");
        document.getElementById("score").classList.add("highlightbg-effect");
        setTimeout(() => document.getElementById("score").classList.remove("highlightbg-effect"), 2000);
        if (Number(score) === WINNING_SCORE) {
            setTimeout(youWin, 3500);
        }
    } else {
        all_flipped.forEach(card => {
            card.classList.remove("flipped-card");
            card.classList.add("nomatch-effect-shake");
            setTimeout(() => card.classList.remove("nomatch-effect-shake"), 500);
            card.style.transform = "rotateY(0deg)";
        });
    }
}

function youWin() {
    clearInterval(INTERVAL);
    let winning_box = document.getElementById("winning-box");
    winning_box.style.display = "block";
    winning_box.classList.add("match-effect-scalein");
    document.getElementById("winning-score").innerHTML = document.getElementById("score").innerHTML;
    document.getElementById("winning-time").innerHTML = document.getElementById("time").innerHTML;
    document.getElementById("winning-moves").innerHTML = document.getElementById("moves").innerHTML;
    let replay = document.getElementById("replay");
    replay.removeAttribute("disabled");
    replay.onclick = () => {
        resetGame();
        winning_box.style.display = "none";
    }
    let close = document.getElementById("close-winning");
    close.onclick = () => {
        document.getElementById("pause-play").setAttribute("disabled", true);
        winning_box.style.display = "none";
    }
}

function youLose() {
    clearInterval(INTERVAL);
    let losing_box = document.getElementById("losing-box");
    losing_box.style.display = "block";
    let close = document.getElementById("close-losing");
    close.onclick = () => {
        losing_box.style.display = "none";
        resetGame();
    }
}

function stopWatch() {
    let tens = 0;
    let secs = 0;
    let mins = 0;
    let tenths = document.getElementById("tenths");
    let seconds = document.getElementById("seconds");
    let minutes = document.getElementById("minutes");
    let pause_play = document.getElementById("pause-play");
    let reset = document.getElementById("reset");

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
        if (mins === 60 && tens > 0) {
            youLose(size);
        }
        tenths.innerHTML = String(tens).padStart(2, "0");
        seconds.innerHTML = String(secs).padStart(2, "0");
        minutes.innerHTML = String(mins).padStart(2, "0");
    }

    const start = () => {
        INTERVAL = setInterval(watch, 10);
        document.removeEventListener("click", start, true);
        pause_play.removeAttribute("disabled");
        reset.removeAttribute("disabled");
    }

    const stop = () => {
        clearInterval(INTERVAL);
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
            document.querySelectorAll(".game-card-back").forEach(card => card.setAttribute("onclick", `flip(event);`));
        }
    }

    reset.onclick = () => {
        stop();
        resetGame();
    }
}

fetchPlayingData();
fetchPokemonData();
fetchMovieData();
setTimeout(() => fetchCards(), 1000);