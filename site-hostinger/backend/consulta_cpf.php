<?php
/**
 * Script para consulta de CPF
 */

// Verificar se o método é POST e se o CPF foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cpf'])) {
    // Obter o CPF enviado e remover caracteres não numéricos
    $cpf = preg_replace('/[^0-9]/', '', $_POST['cpf']);
    
    // Verificar se o CPF tem 11 dígitos
    if (strlen($cpf) !== 11) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CPF inválido. O CPF deve conter 11 dígitos.'
        ]);
        exit;
    }
    
    // Aqui você poderia integrar com uma API externa real
    // Para esse exemplo, vamos simular uma resposta
    
    // Verificar se o CPF é válido (algoritmo de validação)
    if (!validarCPF($cpf)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CPF inválido. Verifique os dígitos.'
        ]);
        exit;
    }
    
    // Simular tempo de consulta externa
    sleep(1);
    
    // Dados simulados (em um cenário real, esses dados viriam de uma API externa)
    $dadosCPF = [
        'status' => 'success',
        'cpf' => formatarCPF($cpf),
        'nome' => 'Nome Exemplo da Silva',
        'nascimento' => '10/05/1985',
        'situacao' => 'Regular',
        'sexo' => 'Masculino'
    ];
    
    // Retornar dados em formato JSON
    echo json_encode($dadosCPF);
    exit;
} else {
    // Método não permitido ou faltando parâmetros
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido ou parâmetros ausentes'
    ]);
    exit;
}

/**
 * Função para validar CPF
 * @param string $cpf CPF sem formatação
 * @return bool
 */
function validarCPF($cpf) {
    // Verificar se foi informado
    if(empty($cpf)) return false;

    // Eliminar possível formatação
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    $cpf = str_pad($cpf, 11, '0', STR_PAD_LEFT);
     
    // Verificar se o número de dígitos é igual a 11
    if (strlen($cpf) != 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (preg_match('/(\d)\1{10}/', $cpf)) return false;
    
    // Algoritmo de verificação dos dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    return true;
}

/**
 * Função para formatar CPF com pontos e traço
 * @param string $cpf CPF sem formatação
 * @return string CPF formatado
 */
function formatarCPF($cpf) {
    // Aplicar formatação
    return substr($cpf, 0, 3) . '.' . 
           substr($cpf, 3, 3) . '.' . 
           substr($cpf, 6, 3) . '-' . 
           substr($cpf, 9, 2);
}
?>
