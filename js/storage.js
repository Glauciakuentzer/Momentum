// Salva um valor no navegador
function salvar(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

// Lê um valor salvo
function carregar(chave, valorPadrao = null) {
    const dado = localStorage.getItem(chave);

    if (dado === null) {
        return valorPadrao;
    }

    return JSON.parse(dado);
}
