import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Base de dados JSON para os links encurtados
const LINKS_DB_PATH = path.join(process.cwd(), 'data', 'links.json');

// Função para garantir que o diretório e o arquivo existam
function ensureDbExists() {
  const dir = path.dirname(LINKS_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(LINKS_DB_PATH)) {
    fs.writeFileSync(LINKS_DB_PATH, JSON.stringify({ links: [] }), 'utf8');
  }
}

// Função para ler o banco de dados
function readLinksDb() {
  ensureDbExists();
  const data = fs.readFileSync(LINKS_DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Função para salvar o banco de dados
function saveLinksDb(data) {
  ensureDbExists();
  fs.writeFileSync(LINKS_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  // Permitir apenas POST para criar links e GET para redirecionar
  if (req.method === 'POST') {
    // Obter a URL a ser encurtada
    const { url, custom_code } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'URL não fornecida' 
      });
    }
    
    try {
      // Verificar se é uma URL válida
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'URL inválida'
      });
    }
    
    // Gerar código único ou usar o personalizado
    let code = custom_code && custom_code.trim() ? custom_code.trim() : nanoid(6);
    
    // Ler o banco de dados
    const db = readLinksDb();
    
    // Verificar se o código já existe
    const existingLink = db.links.find(link => link.code === code);
    if (existingLink) {
      if (custom_code) {
        return res.status(409).json({
          status: 'error',
          message: 'Este código personalizado já está em uso'
        });
      } else {
        // Se o código gerado já existe e não foi personalizado, gerar outro
        code = nanoid(6);
      }
    }
    
    // Obter data atual
    const created_at = new Date().toISOString();
    
    // Adicionar o novo link
    db.links.push({
      code,
      original_url: url,
      created_at,
      clicks: 0
    });
    
    // Salvar o banco de dados
    saveLinksDb(db);
    
    // URL curta completa
    const host = req.headers.host;
    const shortUrl = `${req.headers.host}/r/${code}`;
    
    // Retornar sucesso
    return res.status(200).json({
      status: 'success',
      message: 'URL encurtada com sucesso',
      original_url: url,
      short_url: shortUrl,
      code
    });
  } else if (req.method === 'GET') {
    // Obter todos os links (para administração)
    const db = readLinksDb();
    return res.status(200).json({
      status: 'success',
      links: db.links
    });
  } else {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Método não permitido' 
    });
  }
}
