export default class Cell {

    constructor(row, column) {

        this.revealed = false;
        this.ship = null;
        this.coordinates = [row, column];

    }

    getShip() {

        return this.ship;

    }

    getCoordinates() {

        return this.coordinates;

    }

    setShip(ship) {

        this.ship = ship;

    }

    removeShip() {

        this.ship = null;

    }

    reveal() {

        if (this.revealed === false) {

            this.revealed = true;

        }

    }

    isRevealed() {

        return this.revealed;

    }

    hasShip() {

        if (this.ship === null) {

            return false;

        } else {

            return true;

        }

    }
    
}