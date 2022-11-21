export default class Ship {

    constructor(id, health) {

        this.id = id;
        this.health = health;
        this.damage = 0;
        this.angle = 0;
        this.placed = false;
        this.coordinates = [];

    }

    reset() {

        this.id = this.id;
        this.health = this.health;
        this.damage = 0;
        this.angle = 0;
        this.placed = false;
        this.coordinates = [];

    }

    getId() {

        return this.id;

    }

    getHealth() {

        return this.health;

    }

    getAngle() {

        return this.angle;

    }

    getCoordinates() {

        return this.coordinates;

    }

    getDamage() {

        return this.damage;

    }

    setAngle(angle) {

        this.angle = angle;

    }

    addCoordinates(row, column) {

        this.coordinates.push([row, column]);

    }

    attack() {

        if (this.damage < this.health) {

            this.damage += 1;
            return true;

        }

        return false;

    }

    isSunk() {

        if (this.damage === this.health) {

            return true;

        }

        return false;

    }

    isPlaced() {

        return this.placed;

    }

}