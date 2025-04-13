'use client'

import { useEffect, useRef } from 'react'

export default function MatrixBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Configura o canvas para cobrir toda a tela
    function resizeCanvas() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Colunas para caracteres (densidade baseada na largura)
    let columns
    // Array para rastrear a posição Y de cada coluna
    let drops = []
    
    // Inicializa as colunas
    function initMatrix() {
      // Define a quantidade de colunas com base na largura
      columns = Math.floor(canvas.width / 20)
      
      // Inicializa os drops
      drops = []
      for (let i = 0; i < columns; i++) {
        // Aleatoriza a posição Y inicial
        drops[i] = Math.random() * -canvas.height
      }
    }
    
    initMatrix()
    window.addEventListener('resize', initMatrix)

    // Caracteres possíveis para o efeito matrix
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    // Renderiza o efeito matrix
    function draw() {
      // Fundo semi-transparente para criar o efeito de desbotamento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Define a cor dos caracteres
      ctx.fillStyle = '#0F0'
      ctx.font = '15px monospace'

      // Loop pelos drops
      for (let i = 0; i < drops.length; i++) {
        // Seleciona um caractere aleatório
        const text = chars[Math.floor(Math.random() * chars.length)]
        
        // Posição x baseada no índice da coluna multiplicado pela largura do caractere
        const x = i * 20
        
        // Posição y baseada no valor armazenado no array drops
        const y = drops[i]
        
        // Desenha o caractere
        ctx.fillText(text, x, y)

        // Aumenta a posição Y de cada coluna/drop
        drops[i] += 10
        
        // Reinicia a coluna quando ela sair da tela
        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
      }
    }

    // Atualiza o canvas em intervalos
    const interval = setInterval(draw, 50)

    // Cleanup
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', initMatrix)
    }
  }, [])

  return (
    <div className="matrix-background">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
