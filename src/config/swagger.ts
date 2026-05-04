// src/config/swagger.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { registerUserDocs } from "../modules/user/user.docs";
import { registerEventDocs } from "../modules/event/event.docs";
import { registerBackofficeDocs } from "../modules/backoffice/backoffice.docs";
import { registerGuestDocs } from "../modules/guest/guest.docs";
import { registerAuthDocs } from "../modules/auth/auth.docs";
import { env } from "../env";
export const registry = new OpenAPIRegistry();

export function setupSwagger(app: Express) {
  // Regista os módulos
  registerUserDocs(registry);
  registerEventDocs(registry);
  registerBackofficeDocs(registry);
  registerGuestDocs(registry);
  registerAuthDocs(registry);
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

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
}

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
