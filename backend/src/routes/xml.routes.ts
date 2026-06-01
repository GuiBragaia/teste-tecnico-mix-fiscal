import { Router } from "express";
import multer from "multer";
import { processarXml } from "../services/nfeProcessor.service";
import { isXmlContent } from "../services/xmlParser.service";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "text/xml" ||
      file.mimetype === "application/xml" ||
      file.originalname.toLowerCase().endsWith(".xml");

    if (!ok) {
      cb(new Error("Apenas arquivos XML são permitidos"));
      return;
    }
    cb(null, true);
  },
});

export const xmlRouter = Router();

xmlRouter.post("/upload", upload.array("files", 20), async (req, res) => {
  const arquivos = req.files as Express.Multer.File[] | undefined;

  if (!arquivos?.length) {
    res.status(400).json({ erro: "Nenhum arquivo enviado" });
    return;
  }

  const resultados = [];

  for (const arquivo of arquivos) {
    if (!isXmlContent(arquivo.buffer)) {
      resultados.push({
        arquivo: arquivo.originalname,
        sucesso: false,
        erro: "Conteúdo do arquivo não parece ser XML válido",
      });
      continue;
    }

    const resultado = await processarXml(arquivo.originalname, arquivo.buffer);
    resultados.push(resultado);
  }

  const totalSucesso = resultados.filter((r) => r.sucesso).length;

  res.status(201).json({
    mensagem: `${totalSucesso} de ${resultados.length} arquivo(s) processado(s)`,
    resultados,
  });
});
