import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { app, httpServer } from "./lib/socket.js";

const port = Number(process.env.PORT ?? 5050);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthz", (_req: Request, res: Response) => {
    res.status(200).send("ok");
});

// In production, serve the Vite build output from the same origin.
const frontendDistPath = path.resolve(process.cwd(), "frontend", "dist");
app.use(express.static(frontendDistPath));

// SPA fallback (avoid interfering with Socket.IO endpoints)
// NOTE: Express v5 does not accept `"*"` as a route path, so we use middleware.
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/socket.io")) return next();
    if (req.method !== "GET") return next();

    const accept = String(req.headers.accept ?? "");
    if (!accept.includes("text/html")) return next();

    res.sendFile(path.join(frontendDistPath, "index.html"));
});

httpServer.listen(port, () => {
    console.log("server is listening on port", port);
});




