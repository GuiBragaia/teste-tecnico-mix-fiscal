export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API NF-e Mix Fiscal",
    version: "1.0.0",
    description:
      "API para upload e processamento de XMLs de NF-e com classificação de operação",
  },
  servers: [{ url: "http://localhost:3001" }],
  paths: {
    "/xml/upload": {
      post: {
        summary: "Upload de XML(s) de NF-e",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Processamento concluído" },
          "400": { description: "Requisição inválida" },
        },
      },
    },
    "/resumo/clientes": {
      get: {
        summary: "Resumo de XMLs por cliente interno",
        responses: {
          "200": { description: "Lista com quantidade de compras e vendas" },
        },
      },
    },
    "/resumo/sem-vinculo": {
      get: {
        summary: "XMLs sem vínculo com clientes internos",
        responses: {
          "200": { description: "Lista de notas não identificadas" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "API disponível" } },
      },
    },
  },
};
