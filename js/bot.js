import { randomNumber, indexOfArray } from "./utility.js";

export default class Bot {

    constructor(gameboard) {

        this.gameboard = gameboard;
        this.state = 0;
        this.result = [null, null];
        this.coordinates = [null , null];
        this.possibleCoordinates = null;
        this.knownCoordinates = null;
        this.prevCoord = null;

    }

    resetState() {

        this.state = 0;
        this.result = [null, null];
        this.coordinates = [null, null];
        this.possibleCoordinates = null;
        this.knownCoordinates = null;
        this.prevCoord = null;

    }

    setRandomCoordinates() {

        const maxRow = this.gameboard.getRows();
        const maxColumn = this.gameboard.getColumns();
        const row = randomNumber(maxRow);
        const column = randomNumber(maxColumn);
        const cell = this.gameboard.getCell(row, column);

        if (!cell.isRevealed()) {

            this.coordinates = [row, column];

        } if (cell.isRevealed() && !this.gameboard.isFull()) {

            this.setRandomCoordinates();

        }

    }

    getPossibleCoordinates() {

        const coordinatesArray = [

            [this.coordinates[0] + 1, this.coordinates[1]],
            [this.coordinates[0] - 1, this.coordinates[1]],
            [this.coordinates[0], this.coordinates[1] + 1],
            [this.coordinates[0], this.coordinates[1] - 1]

        ];

        const filteredArray = coordinatesArray.filter((coordinates) => {

            const cell = this.gameboard.getCell(coordinates[0], coordinates[1]);

            if (cell && !cell.isRevealed()) {

                return true;

            } else {

                return false;

            }

        });

        return filteredArray;

    }

    attack() {

        console.log("Attacking: ", this.coordinates)
        this.result = this.gameboard.receiveAttack(...this.coordinates);
        return this.result[0];

    }

    botLogicMedium() {

        if (this.state === 0 && this.result[0] === "miss" || this.result[0] === null) {

            this.setRandomCoordinates();

        } else if ((this.state === 0 && this.result[0] === "hit") || (this.state === 1 && this.result[0] === "miss")) {

            if (this.state === 0) {

                this.state = 1;

            }

            if (this.possibleCoordinates === null) {

                this.possibleCoordinates = this.getPossibleCoordinates();

            }

            if (this.result[0] === "hit") {

                this.prevCoord = this.coordinates;

            }
            
            const randomIndex = randomNumber(this.possibleCoordinates.length);
            this.coordinates = this.possibleCoordinates[randomIndex];
            this.possibleCoordinates.splice(randomIndex, 1);

        } else if (this.state === 1 && this.result[0] === "hit") {

            if (this.knownCoordinates === null) {

                this.knownCoordinates = [...this.result[1].getCoordinates()];
                const prevIndex = indexOfArray(this.knownCoordinates, this.prevCoord);
                this.knownCoordinates.splice(prevIndex, 1);

            }
            
            const hitIndex = indexOfArray(this.knownCoordinates, this.coordinates);
            this.knownCoordinates.splice(hitIndex, 1);
            this.coordinates = this.knownCoordinates[0];

        } else if (this.result[0] === "sunk") {

            this.resetState();
            this.setRandomCoordinates();

        } else if (this.result[0] === false) {

            console.error("FALSE");

        }


    }

    botLogicHard() {

        if (this.result[0] === null || this.result[0] === "miss") {

            this.setRandomCoordinates();

        } if (this.result[0] === "hit") {

            if (this.possibleCoordinates === null) {

                this.possibleCoordinates = [...this.result[1].getCoordinates()];

            }
            const hitIndex = indexOfArray(this.possibleCoordinates, this.coordinates);
            this.possibleCoordinates.splice(hitIndex, 1);
            this.coordinates = this.possibleCoordinates[0];

        } if (this.result[0] === "sunk") {

            this.resetState();
            this.setRandomCoordinates();

        }

    }

    /*botLogicImpossible() {

        if (this.knownCoordinates === null) {

            const shipArray = this.gameboard.getShips();
            this.knownCoordinates = [];

            for (let ship of shipArray) {

                this.knownCoordinates.push(...ship.getCoordinates());

            }

        }

        this.coordinates = this.knownCoordinates[0];
        this.knownCoordinates.splice(0, 1);

    }*/   


}