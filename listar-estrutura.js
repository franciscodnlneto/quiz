const fs = require('fs');
const path = require('path');

// Diretórios para excluir
const excludeDirs = ['node_modules', '.next', '.git'];

// Função para listar a estrutura do diretório
function listDirectoryStructure(dirPath, level = 0, maxLevel = 4) {
  // Verificar se o nível máximo foi atingido
  if (level > maxLevel) return;
  
  // Criar indentação
  const indent = '  '.repeat(level);
  
  try {
    // Ler diretório
    const items = fs.readdirSync(dirPath);
    
    // Iterar sobre os itens
    for (const item of items) {
      // Caminho completo do item
      const itemPath = path.join(dirPath, item);
      
      try {
        // Obter estatísticas do item
        const stats = fs.statSync(itemPath);
        
        // Verificar se é um diretório
        if (stats.isDirectory()) {
          // Pular diretórios excluídos
          if (excludeDirs.includes(item)) continue;
          
          // Imprimir nome do diretório
          console.log(`${indent}${item}/`);
          
          // Listar conteúdo do diretório (recursão)
          listDirectoryStructure(itemPath, level + 1, maxLevel);
        } else {
          // Imprimir nome do arquivo
          console.log(`${indent}${item}`);
        }
      } catch (err) {
        console.log(`${indent}${item} [Erro ao acessar]`);
      }
    }
  } catch (err) {
    console.error(`Erro ao ler diretório ${dirPath}: ${err.message}`);
  }
}

// Iniciar listagem
console.log('Estrutura do Projeto (até o nível 4):');
listDirectoryStructure('.');