import GameBoard from "./gameboard.js";
import Ship from "./ship.js";
import UI from "./ui.js";
import Bot from "./bot.js";
import { sleep } from "./utility.js";

class Game {

    constructor() {
        
        this.menuClickHandler = this.menuClickHandler.bind(this);
        this.menuHoverHandler = this.menuHoverHandler.bind(this);
        this.gameboardEventHandler = this.gameboardEventHandler.bind(this);
        this.modalEventHandler = this.modalEventHandler.bind(this);
        this.dragStartHandler = this.dragStartHandler.bind(this);
        this.dragEndHandler = this.dragEndHandler.bind(this);
        this.dropHandler = this.dropHandler.bind(this);
        this.dragOverHandler = this.dragOverHandler.bind(this);
        
        this.initGame();

    }

    initGame() {

        this.turn = 0;
        this.gameOver = false;
        this.difficulty = "medium";
        this.waitTime = 2000;
        this.gameboardEnemy = new GameBoard(10, 10);
        this.gameboardPlayer = new GameBoard(10, 10);
        this.ui = new UI(this.gameboardEnemy, this.gameboardPlayer);
        this.bot = new Bot(this.gameboardPlayer);

        const playerShips = [new Ship("0", 4), 
                            new Ship("1", 3), 
                            new Ship("2", 3), 
                            new Ship("3", 2), 
                            new Ship("4", 2), 
                            new Ship("5", 1),
                            new Ship("6", 1)];

        this.gameboardPlayer.addShips(playerShips);
        this.initMenu();

        const enemyShips = [new Ship("0", 4), 
                            new Ship("1", 3), 
                            new Ship("2", 3), 
                            new Ship("3", 2), 
                            new Ship("4", 2), 
                            new Ship("5", 1), 
                            new Ship("6", 1)];

        this.gameboardEnemy.addShips(enemyShips);
        this.gameboardEnemy.placeShipsRandomly();

        this.ui.renderGameboards();
        this.ui.addEventListener(this.ui.elements.enemyGameboard, "click", this.gameboardEventHandler);

    }

    initMenu() {

        this.ui.toggleMenu();
        this.ui.renderMenuGameboard();
        this.ui.renderMenuShipsList();
        this.ui.addEventListener(this.ui.elements.menuContainer, "mouseover", this.menuHoverHandler);
        this.ui.addEventListener(this.ui.elements.menuContainer, "click", this.menuClickHandler);

    }

    initDragListeners() {

        this.ui.addShipDragHandlers(this.dragStartHandler, this.dragEndHandler);
        this.ui.addGameboardDragHandlers(this.dropHandler, this.dragOverHandler);

    }

    setDifficulty(difficulty) {

        this.difficulty = difficulty;

    }

    toggleTurn() {

        if (this.turn === 0) {

            this.ui.setTurnMessage("Enemy's turn!", "darkred");
            this.turn = 1;

        } else {

            this.ui.setTurnMessage("Your turn!", "green");
            this.turn = 0;

        }

    }

    gameLoop(result) {

        if (this.turn === 0) {

            if (result === "miss" && result !== false && !this.gameOver) { 

                this.ui.renderGameboards(); 
                this.checkGameStatus();
                this.toggleTurn();
                this.gameLoop();

            } if ((result === "hit" || result === "sunk") && result !== false && !this.gameOver) {

                this.ui.renderGameboards(); 
                this.checkGameStatus();

            }

        } else if (this.turn === 1) {

            sleep(this.waitTime).then(() => {

                const result = this.botTurn();

                if (result === false) {

                    alert("Error occured! Resetting the game...");
                    this.initGame();

                }

                if (result === "miss" && !this.gameOver) {
    
                    this.ui.renderGameboards();
                    this.checkGameStatus();
                    this.toggleTurn();
    
                } if ((result === "hit" || result === "sunk") && !this.gameOver) {
    
    
                    this.ui.renderGameboards();
                    this.checkGameStatus();
                    this.gameLoop();
    
                }

            });

        }

    }

    playerTurn(row, column) {

        if (this.turn === 0) {

            const result = this.gameboardEnemy.receiveAttack(row, column);
            this.gameLoop(result[0]);

        }
        
    }

    botTurn() {

        if (this.difficulty === "easy") {
    
            this.bot.setRandomCoordinates();

        } if (this.difficulty === "medium") {

            this.bot.botLogicMedium();

        } if (this.difficulty === "hard") {

            this.bot.botLogicHard();

        }

        return this.bot.attack();

    }

    checkGameStatus() {

        let gameboard;

        if (this.turn === 0) {

            gameboard = this.gameboardEnemy;

        } else {

            gameboard = this.gameboardPlayer;

        }

        const shipArray = gameboard.getShips();
        const shipCount = shipArray.length;
        let counter = 0;

        for (let ship of shipArray) {

            if (ship.isSunk()) {

                counter += 1;

            }

        }

        if (counter === shipCount) {

            this.gameOver = true;
            this.ui.addEventListener(this.ui.elements.gameEndModal, "click", this.modalEventHandler);
            this.ui.toggleGameEndModal(this.turn);
                
        }

    }

    menuClickHandler(e) {

        const target = e.target;
        console.log(target.tagName)

        if (target.className === "gameboard-cell" && target.dataset.ship === "true") {

            const rowElement = target.parentNode;
            const boardElement = rowElement.parentNode;
            const columnIndex = Array.from(rowElement.children).indexOf(target);
            const rowIndex = Array.from(boardElement.children).indexOf(rowElement);

            this.gameboardPlayer.rotateShip(rowIndex, columnIndex);
 
        } if (target.id === "randomize-button") {

            this.gameboardPlayer.placeShipsRandomly();

        } if (target.id === "reset-button") {

            this.gameboardPlayer.removeAllShips();

        } if (target.id === "continue-button" && this.gameboardPlayer.allShipsPlaced()) {

            const selectedDifficulty = this.ui.elements.difficultySelect.value;
            this.setDifficulty(selectedDifficulty);
            this.ui.toggleMenu();

        } if (target.id === "continue-button" && !this.gameboardPlayer.allShipsPlaced()) {

            alert("Place all of your ships before starting the game!");

        }

        this.ui.renderMenuShipsList();
        this.ui.renderMenuGameboard();
        this.ui.renderGameboards();

    }

    menuHoverHandler(e) {

        const target = e.target;

        if (target.parentElement.className === "menu-ship") {

            this.initDragListeners();

        }

    }

    gameboardEventHandler(e) {

        const cell = e.target;
        
        if (cell.className === "gameboard-cell") {
            
            const rowElement = cell.parentNode;
            const boardElement = rowElement.parentNode;
            const columnIndex = Array.from(rowElement.children).indexOf(cell);
            const rowIndex = Array.from(boardElement.children).indexOf(rowElement);

            this.playerTurn(rowIndex, columnIndex);

        }

    }

    modalEventHandler(e) {

        console.log(e.target.tagName)

        if (e.target.id === "replay-button") {

            this.ui.toggleGameEndModal();
            this.initGame();

        }

    }

    dragStartHandler(e) {

        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.effectsAllowed = "move";

    }

    dragOverHandler(e) {

        e.preventDefault();

    }

    dropHandler(e) {

        e.preventDefault();

        if (e.target.className = "gameboard-cell") {

            const cell = e.target;
            const rowElement = cell.parentNode;
            const boardElement = rowElement.parentNode;
            const columnIndex = Array.from(rowElement.children).indexOf(cell);
            const rowIndex = Array.from(boardElement.children).indexOf(rowElement);
    
            const draggedShipId = e.dataTransfer.getData("text");
            const shipArray = this.gameboardPlayer.getShips();
    
            for (let ship of shipArray) {
    
                const shipId = ship.getId();
    
                if (draggedShipId === shipId && this.gameboardPlayer.checkPlacementValid(rowIndex, columnIndex, ship.getHealth(), 0)) {
    
                    this.gameboardPlayer.placeShip(rowIndex, columnIndex, 0, ship);
    
                }
    
            }

        }

    }

    dragEndHandler(e) {

        e.dataTransfer.clearData();
        this.ui.renderMenuShipsList();
        this.ui.renderMenuGameboard();

    }

}

const game = new Game();