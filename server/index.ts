import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Não expor detalhes técnicos em produção
    let message = "Ocorreu um erro interno. Tente novamente mais tarde.";
    
    // Em desenvolvimento, mostrar mais detalhes
    if (app.get("env") === "development") {
      message = err.message || message;
    } else {
      // Em produção, usar mensagens amigáveis baseadas no status
      switch (status) {
        case 400:
          message = "Dados inválidos fornecidos";
          break;
        case 401:
          message = "Acesso não autorizado";
          break;
        case 403:
          message = "Acesso negado";
          break;
        case 404:
          message = "Recurso não encontrado";
          break;
        case 409:
          message = "Conflito de dados";
          break;
        case 422:
          message = "Dados fornecidos são inválidos";
          break;
        case 429:
          message = "Muitas tentativas. Tente novamente mais tarde";
          break;
        default:
          message = "Ocorreu um erro interno. Tente novamente mais tarde.";
      }
    }

    res.status(status).json({ 
      success: false,
      message,
      ...(app.get("env") === "development" && { error: err.message })
    });
    
    // Log do erro para debugging
    console.error(`Error ${status}:`, err.message);
    if (app.get("env") === "development") {
      console.error(err.stack);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = 'localhost';
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
