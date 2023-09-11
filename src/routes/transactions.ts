import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return { transactions };
  });

  app.get("/:id", async (request) => {
    const getTransactionParmsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParmsSchema.parse(request.params);

    const transcation = await knex("transactions").where("id", id).first();

    return { transcation };
  });

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.status(201).send();
  });
}
