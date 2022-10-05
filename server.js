// everything starts here, none of this is express specific
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require("./app.js");
const c = require("ansi-colors");

const DB = process.env.DB_CONN.replace('<USERNAME>', process.env.DB_UN).replace('<PASSWORD>', process.env.DB_PW);

const mOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

const connect = async () => {
    try {
        await mongoose.connect(DB, mOptions);
        console.log(c.bgMagentaBright("Mongo Connection Open"));
    } catch (error) {
        console.error(error);
        console.log(c.bgRed.yellowBright(`Mongo Connection Error: ${error.message}`));
    }
};

connect();

/*
    SCHEMA
 */
const tourSchema = new mongoose.Schema({
    name: { // schema type options, not mandatory but adds functionality
        type: String,
        required: [true, "A tour must have a name"]
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    }
});

/*
    MODEL
 */
const Tour = mongoose.model('Tour', tourSchema);

/*
    DOCUMENTS
 */

const testTour = new Tour({ // works like a constructor, is an instance of the Tour model
    name: "The Garden of the Mind",
    rating: 5,
    price: 0.01
});

const parkCamperTour = new Tour(
    {
        name: "The Great Pretzel Factory",
        price: 1000
    }
);

// model methods
// testTour.save()

const saveDoc = async doc => {
    try {
        await doc.save(); // returns doc incl _id
        console.log("Document Saved");
        console.log(doc);
    } catch (error) {
        console.error(error);
    }
};
saveDoc(testTour);
saveDoc(parkCamperTour);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));
