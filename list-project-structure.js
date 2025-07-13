import dirTree from "directory-tree";
import { join } from "path";

// Configurações
const ROOT_DIR = "."; // Diretório raiz do projeto
const EXCLUDED = [/node_modules/, /dist/, /build/, /\.git/]; // Pastas/arquivos a ignorar

// Função para formatar a saída como texto
function formatTree(tree, level = 0, prefix = "") {
  let output = "";
  if (level === 0) {
    output += `${tree.name}\n`;
  }

  tree.children
    .sort((a, b) => {
      // Ordena: diretórios primeiro, depois arquivos
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    })
    .forEach((child, index, array) => {
      const isLast = index === array.length - 1;
      output += `${prefix}${isLast ? "└── " : "├── "}${child.name}\n`;
      if (child.type === "directory") {
        output += formatTree(
          child,
          level + 1,
          `${prefix}${isLast ? "    " : "│   "}`
        );
      }
    });

  return output;
}

// Gera a árvore de diretórios
const tree = dirTree(ROOT_DIR, {
  exclude: EXCLUDED,
  attributes: ["type"],
});

// Exibe a estrutura
console.log("Estrutura do Projeto:");
console.log(formatTree(tree));
