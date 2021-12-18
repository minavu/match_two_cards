let game_board = document.getElementById("game-board");
let card_deck = "https://deckofcardsapi.com/api/deck/new/draw/?count=8";

fetch(card_deck)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let {cards} = data;
        let cards_twice = [...cards, ...cards];
        console.log(cards_twice);
        cards_twice.forEach(card => {
            let card_image = document.createElement("img");
            card_image.setAttribute("src", card.image);
            card_image.setAttribute("alt", card.code);
            card_image.setAttribute("class", "game-card");
            game_board.append(card_image);
        })
    })
    .catch(error => {
        console.error("Request failed", error)
    })
;

