export default class UI {

    constructor(gameboardEnemy, gameboardPlayer) {

        this.gameboardEnemy = gameboardEnemy;
        this.gameboardPlayer = gameboardPlayer;

        this.elements = {

            gameContainer: document.querySelector(".game-container"),
            turnMessage: document.querySelector("#turn-message"),
            menuContainer: document.querySelector(".menu-container"),
            menuGameboard: document.querySelector(".menu-container > .gameboard"),
            menuShipList: document.querySelector(".menu-ship-list"),
            playerContainer: document.querySelector(".player-container"),
            playerGameboard: document.querySelector(".player-container > .gameboard"),
            playerRemainingShips: document.querySelector(".player-container > .remaining-ships"),
            enemyContainer: document.querySelector(".enemy-container"),
            enemyGameboard: document.querySelector(".enemy-container > .gameboard"),
            enemyRemainingShips: document.querySelector(".enemy-container > .remaining-ships"),
            gameEndModal: document.querySelector(".game-end-modal-container"),
            gameEndModalText: document.querySelector(".game-end-modal-content > p"),
            difficultySelect: document.querySelector("#difficulty-select")

        }

    }

    addEventListener(element, type, callback) {

        element.removeEventListener(type, callback);
        element.addEventListener(type, callback);

    }

    addShipDragHandlers(dragStartCallback, dragEndCallback) { //TODO: Do these while rendering

        const shipElementArray = Array.from(this.elements.menuShipList.children);

        for (let shipElement of shipElementArray) {

            shipElement.ondragstart = dragStartCallback;
            shipElement.ondragend = dragEndCallback;

        }

    }

    addGameboardDragHandlers(dropCallback, dragOverCallback) { //TODO: Do these while rendering

        const rowElementArray = Array.from(this.elements.menuGameboard.children);

        for (let rowElement of rowElementArray) {

            const cellElementArray = Array.from(rowElement.children);

            for (let cellElement of cellElementArray) {

                cellElement.ondrop = dropCallback;
                cellElement.ondragover = dragOverCallback;

            }

        }

    }

    toggleMenu() {

        this.elements.menuContainer.dataset.visible = this.elements.menuContainer.dataset.visible === "true" ? "false" : "true";
        this.elements.gameContainer.dataset.visible = this.elements.gameContainer.dataset.visible === "true" ? "false" : "true";

    }

    toggleGameEndModal(winner) {

        const modalDesc = winner === 0 ? "You have won the game." : "You have lost the game.";
        this.elements.gameEndModalText.textContent = modalDesc;
        const isVisible = this.elements.gameEndModal.dataset.visible;
        console.log(isVisible)
        this.elements.gameEndModal.dataset.visible = isVisible === "true" ? "false" : "true";

    }

    setTurnMessage(text, color) {

        this.elements.turnMessage.textContent = text;
        this.elements.turnMessage.style.color = color;

    }

    renderGameboard(gameboardObject, type) {

        const gameboard = gameboardObject.getBoard();
        const rows = gameboardObject.getRows();
        const columns = gameboardObject.getColumns();
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < rows; i++) {

            const row = document.createElement("div");
            row.className = "gameboard-row";

            for (let k = 0; k < columns; k++) {

                const cell = document.createElement("div");
                cell.classList.add("gameboard-cell");
                cell.dataset.type = type > 0 ? "enemy" : "player";
                cell.dataset.revealed = gameboard[i][k].isRevealed();
                cell.dataset.ship = gameboard[i][k].hasShip();

                if (gameboard[i][k].isRevealed() && !gameboard[i][k].hasShip()) {

                    cell.textContent = "●";

                } else if (gameboard[i][k].isRevealed() && gameboard[i][k].hasShip()) {

                    const ship = gameboard[i][k].getShip();

                    if (!ship.isSunk()) {

                        cell.dataset.ship = "hit";
                        cell.textContent = "✛";

                    } else {

                        cell.dataset.ship = "sunk";
                        cell.textContent = "╳";

                    }

                }

                row.appendChild(cell);

            }

            fragment.appendChild(row);

        }

        return fragment;

    }

    renderPlayerGameboard() {

        const playerFragment = this.renderGameboard(this.gameboardPlayer, 0);
        this.elements.playerGameboard.replaceChildren(playerFragment);

    }

    renderEnemyGameboard() {

        const enemyFragment = this.renderGameboard(this.gameboardEnemy, 1);
        this.elements.enemyGameboard.replaceChildren(enemyFragment);

    }

    renderMenuGameboard() {

        const playerFragment = this.renderGameboard(this.gameboardPlayer, 0);
        this.elements.menuGameboard.replaceChildren(playerFragment);

    }

    renderMenuShips(gameboardObject) {

        const shipArray = gameboardObject.getShips();
        const fragment = document.createDocumentFragment();

        for (let ship of shipArray) {

            if (ship.isPlaced()) {

                continue;

            }
            
            const shipElement = document.createElement("div");
            const shipLength = ship.getHealth();

            shipElement.className = "menu-ship";
            shipElement.setAttribute("draggable", "true");
            shipElement.id = ship.getId();

            for (let i = 0; i < shipLength; i++) {

                const shipPartElement = document.createElement("span");
                shipPartElement.className = "menu-ship-part";
                //Disable dragging for child elements
                /*shipPartElement.draggable = "true";
                shipPartElement.ondragstart = function(e) {

                    e.preventDefault(); 
                    //e.stopPropagation(); Does this prevent bubbling?

                };*/

                shipElement.appendChild(shipPartElement);

            }

            fragment.appendChild(shipElement);

        }

        return fragment;

    }

    renderMenuShipsList() {

        const fragment = this.renderMenuShips(this.gameboardPlayer);
        this.elements.menuShipList.replaceChildren(fragment);

    }

    renderRemainingShips(gameboardObject) {

        const shipArray = gameboardObject.getShips();
        const fragment = document.createDocumentFragment();

        for (let ship of shipArray) {
            
            const shipElement = document.createElement("div");
            const shipLength = ship.getHealth();
            let shipHitCount = ship.getDamage();

            shipElement.className = "remaining-ship";
            shipElement.dataset.sunk = ship.isSunk() ? true : false;

            for (let i = 0; i < shipLength; i++) {

                const shipPartElement = document.createElement("span");
                shipPartElement.className = "remaining-ship-part";
                shipPartElement.dataset.hit = "false";

                if (shipHitCount > 0) {

                    shipPartElement.dataset.hit = "true"
                    shipHitCount -= 1;

                }

                shipElement.appendChild(shipPartElement);

            }

            fragment.appendChild(shipElement);

        }

        return fragment;

    }

    renderRemainingShipsList() {

        const playerFragment = this.renderRemainingShips(this.gameboardPlayer);
        const enemyFragment = this.renderRemainingShips(this.gameboardEnemy);
        this.elements.playerRemainingShips.replaceChildren(playerFragment);
        this.elements.enemyRemainingShips.replaceChildren(enemyFragment);

    }

    renderGameboards() {

        this.renderPlayerGameboard();
        this.renderEnemyGameboard();
        this.renderRemainingShipsList();

    }

}