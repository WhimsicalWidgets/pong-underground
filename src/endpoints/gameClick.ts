import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class GameClickEndpoint extends OpenAPIRoute {
  schema = {
    tags: ["Game"],
    summary: "Record a game button click",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              timestamp: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Click recorded successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              id: z.number(),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    const data = await c.req.json();
    
    const userAgent = c.req.header("User-Agent") || null;
    const ipAddress = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || null;
    
    const result = await c.env.DB.prepare(
      "INSERT INTO game_clicks (user_agent, ip_address) VALUES (?, ?) RETURNING id"
    ).bind(userAgent, ipAddress).first();

    return {
      success: true,
      id: result.id,
    };
  }
}