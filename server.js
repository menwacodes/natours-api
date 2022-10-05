// everything starts here

const c = require("ansi-colors");
const app = require("./app.js");

const port = 3000;
app.listen(port, () => console.log(c.bgGreenBright(`Listening on http://localhost:${port}`)));
