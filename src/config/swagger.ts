// src/config/swagger.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { registerUserDocs } from "../modules/user/user.docs";
import { registerEventDocs } from "../modules/event/event.docs";
import { registerBackofficeDocs } from "../modules/backoffice/backoffice.docs";
import { registerTicketDocs } from "../modules/ticket/ticket.docs";
import { registerAuthDocs } from "../modules/auth/auth.docs";
import { registerNotificationDocs } from "../modules/notification/notification.docs";
import { registerCommentDocs } from "../modules/comment/comment.docs";
import { registerGalaryDocs } from "../modules/galary/galary.docs";
import { env } from "../env";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export function setupSwagger(app: Express) {
  registerUserDocs(registry);
  registerEventDocs(registry);
  registerBackofficeDocs(registry);
  registerTicketDocs(registry);
  registerAuthDocs(registry);
  registerNotificationDocs(registry);
  registerCommentDocs(registry);
  registerGalaryDocs(registry);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Honor API",
      version: "1.0.0",
      description: "Documentação da API Honor",
    },
    servers: [{ url: env.BASE_API_URL || "http://localhost:3000/api/v1" }],
  });

  // ✅ Rota JSON pura para o Apidog
  app.get("/docs/json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(document);
  });

  // UI visual (Swagger)
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
}
