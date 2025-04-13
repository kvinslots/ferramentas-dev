import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

// Configuração para permitir o processamento do form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Método não permitido' });
  }

  // Diretório para arquivos processados
  const uploadDir = path.join(process.cwd(), 'public', 'processed');
  
  // Criar diretório se não existir
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erro ao criar diretório de upload', error: error.message });
  }

  // Parse do formulário multipart
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ status: 'error', message: 'Erro ao processar upload', error: err.message });
        return resolve();
      }

      // Verificar se há arquivo enviado
      if (!files.arquivo) {
        res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado' });
        return resolve();
      }

      const file = files.arquivo;
      
      // Obter extensão e tipo de arquivo
      const extension = path.extname(file.filepath).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension);
      const isVideo = ['.mp4', '.mov', '.avi', '.wmv', '.mkv'].includes(extension);

      try {
        if (isImage) {
          // Processar imagem com Sharp (remove metadados)
          const outputFilename = `sem_metadados_${Date.now()}${extension}`;
          const outputPath = path.join(uploadDir, outputFilename);
          
          await sharp(file.filepath)
            .rotate() // Aplica rotação baseada nos dados EXIF mas remove os metadados
            .withMetadata(false) // Remove todos os metadados
            .toFile(outputPath);
          
          // Remover arquivo original
          fs.unlinkSync(file.filepath);
          
          // Retornar sucesso
          res.status(200).json({
            status: 'success',
            message: 'Metadados removidos com sucesso',
            arquivo_original: file.originalFilename,
            arquivo_processado: outputFilename,
            url_download: `/processed/${outputFilename}`
          });
          
        } else if (isVideo) {
          // Para vídeos, é mais complexo na Vercel
          // Como a Vercel não permite execução de comandos como FFmpeg,
          // podemos oferecer um método alternativo ou informar limitação
          res.status(400).json({
            status: 'warning',
            message: 'Remoção de metadados de vídeo não disponível na versão hospedada. Use a versão local para esta funcionalidade.'
          });
          
        } else {
          res.status(400).json({
            status: 'error',
            message: 'Tipo de arquivo não suportado. Apenas imagens (JPG, PNG, GIF, WebP) e vídeos (MP4, MOV, AVI, WMV, MKV) são aceitos.'
          });
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        res.status(500).json({
          status: 'error',
          message: 'Erro ao processar arquivo',
          error: error.message
        });
      }
      
      resolve();
    });
  });
}
