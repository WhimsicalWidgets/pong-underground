import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class GameStatsEndpoint extends OpenAPIRoute {
  schema = {
    tags: ["Game"],
    summary: "Get game statistics",
    responses: {
      "200": {
        description: "Game statistics",
        content: {
          "application/json": {
            schema: z.object({
              forPong: z.number(),
              notForPong: z.union([z.number(), z.string()]),
            }),
          },
        },
      },
    },
  };

  async handle(c) {
    const result = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM game_clicks"
    ).first();

    const forPong = result?.count || 0;
    const notForPong = "??"; // Static "??" for "Not for pong"

    return {
      forPong,
      notForPong,
    };
  }
}