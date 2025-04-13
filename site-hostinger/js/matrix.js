document.addEventListener('DOMContentLoaded', function() {
    const matrixBackground = document.getElementById('matrix-background');
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    
    // Configurações do efeito matriz
    const columnCount = Math.floor(window.innerWidth / 20);
    const maxSpeed = 50;
    const minSpeed = 30;
    
    // Array para guardar as colunas de caracteres
    const columns = [];
    
    // Inicializar colunas
    for (let i = 0; i < columnCount; i++) {
        columns.push({
            x: Math.random() * window.innerWidth,
            chars: [],
            speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
            nextCharTime: Math.random() * 2000
        });
    }
    
    // Iniciar animação
    function animate() {
        // Adicionar novos caracteres aleatoriamente
        columns.forEach(column => {
            column.nextCharTime -= 16.7; // Aproximadamente 60 FPS
            
            if (column.nextCharTime <= 0) {
                createChar(column);
                column.nextCharTime = Math.random() * 2000;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    // Criar um novo caractere em uma coluna
    function createChar(column) {
        const char = document.createElement('div');
        char.className = 'matrix-character';
        
        // Posição do caractere
        char.style.left = column.x + 'px';
        char.style.top = '0px';
        
        // Caractere aleatório
        char.textContent = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Adicionar ao DOM
        matrixBackground.appendChild(char);
        
        // Adicionar à coluna
        column.chars.push({
            element: char,
            position: 0
        });
        
        // Animar o caractere caindo
        animateChar(column, char);
    }
    
    // Animar o caractere descendo
    function animateChar(column, element) {
        let position = 0;
        const speed = column.speed;
        const maxPosition = window.innerHeight;
        
        function move() {
            position += speed / 10;
            element.style.top = position + 'px';
            
            // Atualizar caractere aleatoriamente (piscar)
            if (Math.random() < 0.02) {
                element.textContent = characters.charAt(Math.floor(Math.random() * characters.length));
            }
            
            // Remover caractere ao sair da tela
            if (position > maxPosition) {
                element.remove();
                return;
            }
            
            requestAnimationFrame(move);
        }
        
        move();
    }
    
    // Iniciar animação
    animate();
    
    // Redimensionar evento
    window.addEventListener('resize', function() {
        // Limpar caracteres existentes
        matrixBackground.innerHTML = '';
        
        // Reinicializar colunas
        columns.length = 0;
        const newColumnCount = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < newColumnCount; i++) {
            columns.push({
                x: Math.random() * window.innerWidth,
                chars: [],
                speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
                nextCharTime: Math.random() * 2000
            });
        }
    });
});
