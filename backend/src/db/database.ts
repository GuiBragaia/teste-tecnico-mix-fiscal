import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { env } from "../config/env";

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(env.databasePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(env.databasePath);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS nfe_documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chave TEXT NOT NULL UNIQUE,
      emitente_nome TEXT NOT NULL,
      emitente_cnpj TEXT NOT NULL,
      destinatario_nome TEXT NOT NULL,
      destinatario_cnpj TEXT NOT NULL,
      valor_total REAL NOT NULL,
      data_emissao TEXT NOT NULL,
      operacao TEXT NOT NULL,
      cliente_id INTEGER,
      cliente_nome TEXT,
      motivo_nao_identificado TEXT,
      xml_original TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fila_processamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chave TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      nome_parte TEXT NOT NULL,
      motivo TEXT NOT NULL,
      xml_original TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      criado_em TEXT DEFAULT (datetime('now'))
    );
  `);
}
