import { useEffect } from 'react';
import { useRouter } from 'next/router';
import fs from 'fs';
import path from 'path';

// Página para redirecionamento de URLs encurtadas
export default function Redirect({ redirect, notFound }) {
  const router = useRouter();

  useEffect(() => {
    if (notFound) {
      router.replace('/404');
    } else if (redirect) {
      // Redirecionar para a URL original
      window.location.href = redirect;
    }
  }, [notFound, redirect, router]);

  // Mostrar uma mensagem de carregamento enquanto redireciona
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-pulse mb-4">
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Redirecionando...</h1>
      <p className="text-gray-400">Você será redirecionado em instantes.</p>
    </div>
  );
}

// Função para buscar dados no momento da requisição ao servidor
export async function getServerSideProps({ params }) {
  const { code } = params;
  
  // Caminho para o banco de dados de links
  const dbPath = path.join(process.cwd(), 'data', 'links.json');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(dbPath)) {
    return { props: { notFound: true } };
  }
  
  try {
    // Ler o banco de dados
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Buscar o link pelo código
    const link = data.links.find(link => link.code === code);
    
    if (!link) {
      return { props: { notFound: true } };
    }
    
    // Incrementar o contador de cliques
    link.clicks += 1;
    
    // Salvar as alterações no banco de dados
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Retornar a URL original para redirecionamento
    return { props: { redirect: link.original_url } };
  } catch (error) {
    console.error('Erro ao buscar link:', error);
    return { props: { notFound: true } };
  }
}
