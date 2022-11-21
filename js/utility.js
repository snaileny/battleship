export {randomNumber, indexOfArray, sleep};

const randomNumber = (max) => {

    return Math.floor(Math.random() * max);

}

const indexOfArray = (parentArr, childArr) => {

    for (let i = 0; i < parentArr.length; i++) {

        if (parentArr[i][0] === childArr[0] && parentArr[i][1] === childArr[1]) {

            return i;

        }

    }

}

const sleep = (time) => {
    
    return new Promise((resolve) => setTimeout(resolve, time));

}