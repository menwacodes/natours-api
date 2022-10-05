// everything starts here, none of this is express specific
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})

const app = require("./app.js");
const c = require("ansi-colors");

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));
