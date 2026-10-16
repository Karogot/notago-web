// Normaliza a descrição de um produto para permitir comparar o "mesmo" produto
// vindo de notas fiscais diferentes (cada mercado escreve a descrição de um jeito:
// "COCA COLA 2L", "Coca-Cola 2 L", "COCA-COLA  2L" etc. deveriam virar a mesma chave).
export function normalizeProductName(description) {
  return (description || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ') // remove pontuação, mantém letras/números
    .replace(/\s+/g, ' ')
    .trim();
}
