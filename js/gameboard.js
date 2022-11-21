import Cell from "./cell.js";

export default class Gameboard {

    constructor(rows, columns) {

        this.rows = rows;
        this.columns = columns;
        this.ships = [];
        this.initBoard(this.rows, this.columns);

    }

    getRows() {

        return this.rows;

    }

    getColumns() {

        return this.columns;

    }

    getBoard() {

        return this.board;

    }

    getCell(row, column) {

        if (this.checkCoordinatesValid(row, column)) {

            return this.board[row][column];

        } else {

            return false;

        }

    }

    getShips() {

        return this.ships;

    }

    initBoard() {

        this.board = [];

        for (let i = 0; i < this.rows; i++) {

            const row = [];

            for (let k = 0; k < this.columns; k++) {

                const cell = new Cell(i, k);
                row.push(cell);

            }

            this.board.push(row);

        }

    }

    isFull() {

        for (let i = 0; i < this.rows; i++) {

            for (let k = 0; k < this.columns; k++) {

                if (!this.board[i][k].isRevealed()) {

                    return false;

                }

            }

        }

        return true;

    }

    addShips(shipArr) {

        this.ships = shipArr;

    }

    allShipsPlaced() {

        const shipArray = this.getShips();

        for (let ship of shipArray) {

            if (!ship.isPlaced()) {

                return false;

            }

        }

        return true;

    }

    placeShip(row, column, angle, ship) {

        ship.placed = true;
        ship.setAngle(angle);
        const shipLength = ship.getHealth();
        const isPlacementValid = this.checkPlacementValid(row, column, shipLength, angle);

        if (!isPlacementValid) {

            return false;

        }

        for (let i = 0; i < shipLength; i++) {

            if (angle === 0) {

                this.board[row][column + i].setShip(ship);
                ship.addCoordinates(row, column + i);

            } if (angle === 1) {

                this.board[row + i][column].setShip(ship);
                ship.addCoordinates(row + i, column);

            }

        }

        return true;

    }

    rotateShip(row, column) {

        const cell = this.getCell(row, column);

        if (cell === false) {

            return false;

        }

        const ship = cell.getShip();
        const shipStartCoordinates = ship.getCoordinates()[0];
        const currentAngle = ship.getAngle();
        const turnAngle = currentAngle === 0 ? 1 : 0;

        this.removeShip(row, column);

        if (this.checkPlacementValid(row, column, ship.getHealth(), turnAngle)) {

            this.placeShip(shipStartCoordinates[0], shipStartCoordinates[1], turnAngle, ship);

        } else {

            this.placeShip(shipStartCoordinates[0], shipStartCoordinates[1], currentAngle, ship);

        }

    }

    removeShip(row, column) {

        const cell = this.getCell(row, column);

        if (cell !== false && cell.hasShip()) {

            const ship = cell.getShip();
            const coordinatesArray = ship.getCoordinates();
            ship.reset();
            
            for (let coordinates of coordinatesArray) {

                this.board[coordinates[0]][coordinates[1]].removeShip();

            }

        }

    }

    removeAllShips() {

        for (let i = 0; i < this.rows; i++) {

            for (let k = 0; k < this.columns; k++) {

                this.removeShip(i, k);

            }

        }

    }

    placeShipsRandomly() {

        const randomNumber = (num) => {

            return Math.floor(Math.random() * num);

        }

        const place = (ship) => {

            const row = randomNumber(this.rows);
            const column = randomNumber(this.columns);
            const angle = randomNumber(2);

            return this.placeShip(row, column, angle, ship);

        }

        this.removeAllShips();

        let i = 0;

        while (i < this.ships.length) {

            const ship = this.ships[i];
            let result = place(ship);

            if (result) {

                i++;

            } 

        }

    }

    receiveAttack(row, column) {

        const revealAroundShip = (row, column, ship) => {

            this.receiveAttack(row + 1, column - 1);
            this.receiveAttack(row + 1, column + 1);
            this.receiveAttack(row - 1, column - 1);
            this.receiveAttack(row - 1, column + 1);

            if (ship.isSunk()) {

                const shipCoordinates = ship.getCoordinates();
                const cellsAroundShip = this.traverseAroundShip(shipCoordinates[0][0], shipCoordinates[0][1], ship.getHealth(), ship.getAngle());
                cellsAroundShip.forEach((cell) => {

                    cell.reveal();

                });

            }

        }

        if (!this.checkCoordinatesValid(row, column)) {
            
            return false;
        
        }

        const cell = this.board[row][column];

        if (cell.constructor.name === "Cell" && cell.hasShip() && !cell.isRevealed()) {

            cell.reveal();
            const ship = cell.getShip();
            ship.attack();
            revealAroundShip(row, column, ship);
            
            if (ship.isSunk()) {

                return ["sunk", ship];

            }

            return ["hit", ship];

        } if (cell.constructor.name === "Cell" && !cell.isRevealed()) {

            cell.reveal();
            return ["miss", cell];

        }

        return [false];

    }

    checkCoordinatesValid(row, column) {

        if ((row >= 0 && row < this.rows) && (column >= 0 && column < this.columns)) {

            return true;

        }

        return false;

    }

    checkPlacementValid(row, column, length, angle) {

        const remainingColumns = this.columns - column;
        const remainingRows = this.rows - row;

        if (remainingColumns >= length && angle === 0) {

            const cellArray = this.traverseAroundShip(row, column, length, angle);

            for (const cell of cellArray) {

                if (cell.hasShip()) {
                    
                    return false;

                }

            }

            return true;

        } if (remainingRows >= length && angle === 1) {

            const cellArray = this.traverseAroundShip(row, column, length, angle);

            for (const cell of cellArray) {
                
                if (cell.hasShip()) {
                    
                    return false;

                }

            }

            return true;

        }

        return false;

    }

    traverseAroundCoordinates(row, column) {

        const cellArray = [];

        const startRow = row - 1;
        const startColumn = column - 1;

        for (let i = 0; i < 3; i++) {

            for (let k = 0; k < 3; k++) {

                if (!this.checkCoordinatesValid(startRow + i, startColumn + k) || [row, column] === [i, k]) {

                    continue;

                }
                
                const cell = this.board[startRow + i][startColumn + k];
                cellArray.push(cell);

            }

        }

        return cellArray;

    }

    traverseAroundShip(row, column, length, angle) { //break the loop on the middle column

        const cellArray = [];
        const startRow = row - 1;
        const startColumn = column - 1;
        const newLength = length + 2;

        if (angle === 0) {

            for (let i = 0; i < 3; i++) {

                for (let k = 0; k < newLength; k++) {

                    if (!this.checkCoordinatesValid(startRow + i, startColumn + k)) {

                        continue;

                    }
                    
                    const cell = this.board[startRow + i][startColumn + k];
                    cellArray.push(cell);

                }

            }

        } if (angle === 1) {

            for (let i = 0; i < 3; i++) {

                for (let k = 0; k < newLength; k++) {

                    if (!this.checkCoordinatesValid(startRow + k, startColumn + i)) {

                        continue;

                    }

                    const cell = this.board[startRow + k][startColumn + i];
                    cellArray.push(cell); 

                }

            }

        }

        return cellArray;

    }

}