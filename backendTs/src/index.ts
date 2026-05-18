import express from "express";
import { app, httpServer } from "./lib/socket.js";

const port = Number(process.env.PORT ?? 5050);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("working");
});

httpServer.listen(port, () => {
    console.log("server is listening on port", port);
});




