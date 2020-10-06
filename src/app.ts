import express from "express";

const app = express();
const port = 8080;

app.set("view engine", "ejs")
app.get("/", (_, res) => {
    res.render("pages/home");
});
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});


