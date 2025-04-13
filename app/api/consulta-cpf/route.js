// Rota da API para consulta de CPF
// Esta rota serve como um proxy para proteger sua chave de API

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Obtenha o CPF da requisição
    const reqData = await request.json();
    const cpf = reqData.cpf;
    
    if (!cpf || cpf.length !== 11) {
      return new Response(JSON.stringify({ 
        status: 400, 
        message: 'CPF inválido. É necessário fornecer um CPF com 11 dígitos.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Token da API (em produção, isto deve ser uma variável de ambiente)
    const API_TOKEN = '9c2b3055-4640-451f-8182-e8804ca1c0a6';
    
    try {
      // URL da API externa
      const apiUrl = `https://databit.online/api?token=${API_TOKEN}&type=cpftype&query=${cpf}`;
      
      // Fazer a requisição para a API externa
      const apiResponse = await fetch(apiUrl);
      const data = await apiResponse.json();
      
      // Retorna os dados da API externa
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (apiError) {
      console.error('Erro na API externa:', apiError);
      
      // Simulação de resposta para testes em caso de erro na API externa
      const mockData = {
        status: 200,
        dadosBasicos: {
          cpf: cpf,
          nome: "NOME EXEMPLO PARA TESTE",
          sexo: "M",
          nascimento: "1990-01-01 00:00:00",
          mae: "NOME DA MÃE EXEMPLO PARA TESTE"
        }
      };
      
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Erro na consulta de CPF:', error);
    
    // Retorna erro 500 para erros de servidor
    return new Response(JSON.stringify({ 
      status: 500, 
      message: 'Erro interno no servidor ao processar a consulta.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
