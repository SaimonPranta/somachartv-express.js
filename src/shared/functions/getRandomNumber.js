const getRandomNumber = (min = 1, max = 6) => {
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = getRandomNumber