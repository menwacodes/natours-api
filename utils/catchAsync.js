module.exports = fn => {
    return (req, res, next) => { // returns a function, alternative is to immediately call it
        fn(req, res, next).catch(err => next(err)); // fn is async, returns a promise and if it's rejected, that can be caught
    };
};