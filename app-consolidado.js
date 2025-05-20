// Elementos do DOM
const livrosATContainer = document.getElementById('livros-at');
const livrosNTContainer = document.getElementById('livros-nt');
const tituloLivro = document.getElementById('titulo-livro');
const capitulosContainer = document.getElementById('capitulos-container');
const infoCapitulo = document.getElementById('info-capitulo');
const btnCapituloAnterior = document.getElementById('btn-capitulo-anterior');
const btnProximoCapitulo = document.getElementById('btn-proximo-capitulo');
const conteudoTexto = document.getElementById('conteudo-texto');
const carregandoElement = document.getElementById('carregando');
const conteudoBibliaElement = document.getElementById('conteudo-biblia');
const erroMensagemElement = document.getElementById('erro-mensagem');

// Estado da aplicação
let livroAtual = null;
let capituloAtual = 1;
let abreviacaoAtual = '';

// Inicialização
document.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
    // Preencher listas de livros do AT e NT
    preencherListasLivros();
    
    // Carregar Gênesis por padrão
    carregarLivroSelecionado('Gn');
    
    // Configurar eventos dos botões de navegação
    btnCapituloAnterior.addEventListener('click', () => mudarCapitulo(capituloAtual - 1));
    btnProximoCapitulo.addEventListener('click', () => mudarCapitulo(capituloAtual + 1));
}

// Preencher as listas de livros do AT e NT
function preencherListasLivros() {
    // Limpar containers
    livrosATContainer.innerHTML = '';
    livrosNTContainer.innerHTML = '';
    
    // Filtrar e adicionar livros do AT
    indiceLivros
        .filter(livro => livro.testamento === 'AT')
        .forEach(livro => {
            const button = document.createElement('button');
            button.textContent = livro.nome;
            button.dataset.abreviacao = livro.abreviacao;
            button.addEventListener('click', () => carregarLivroSelecionado(livro.abreviacao));
            livrosATContainer.appendChild(button);
        });
    
    // Filtrar e adicionar livros do NT
    indiceLivros
        .filter(livro => livro.testamento === 'NT')
        .forEach(livro => {
            const button = document.createElement('button');
            button.textContent = livro.nome;
            button.dataset.abreviacao = livro.abreviacao;
            button.addEventListener('click', () => carregarLivroSelecionado(livro.abreviacao));
            livrosNTContainer.appendChild(button);
        });
}

// Carregar um livro específico
function carregarLivroSelecionado(abreviacao) {
    try {
        mostrarCarregando();
        ocultarErro();
        
        // Obter os dados do livro do objeto bibliaCompleta
        livroAtual = bibliaCompleta[abreviacao];
        abreviacaoAtual = abreviacao;
        
        if (!livroAtual) {
            mostrarErro(`Livro ${abreviacao} não encontrado.`);
            return;
        }
        
        // Atualizar UI
        atualizarBotoesLivros(abreviacao);
        tituloLivro.textContent = livroAtual.nome;
        
        // Gerar botões de capítulos
        gerarBotoesCapitulos();
        
        // Carregar primeiro capítulo por padrão
        capituloAtual = 1;
        carregarCapitulo(capituloAtual);
        
        ocultarCarregando();
    } catch (error) {
        mostrarErro(`Erro ao carregar o livro: ${error.message}`);
        console.error(error);
    }
}

// Atualizar estado visual dos botões de livros
function atualizarBotoesLivros(abreviacaoAtiva) {
    // Remover classe ativo de todos os botões
    document.querySelectorAll('.livros-lista button').forEach(button => {
        button.classList.remove('ativo');
    });
    
    // Adicionar classe ativo ao botão do livro atual
    document.querySelectorAll(`.livros-lista button[data-abreviacao="${abreviacaoAtiva}"]`).forEach(button => {
        button.classList.add('ativo');
    });
}

// Gerar botões para os capítulos do livro atual
function gerarBotoesCapitulos() {
    capitulosContainer.innerHTML = '';
    
    if (!livroAtual || !livroAtual.capitulos) return;
    
    livroAtual.capitulos.forEach(capitulo => {
        const button = document.createElement('button');
        button.textContent = capitulo.numero;
        button.addEventListener('click', () => mudarCapitulo(capitulo.numero));
        capitulosContainer.appendChild(button);
    });
}

// Mudar para um capítulo específico
function mudarCapitulo(numero) {
    if (!livroAtual) return;
    
    const totalCapitulos = livroAtual.capitulos.length;
    
    if (numero >= 1 && numero <= totalCapitulos) {
        capituloAtual = numero;
        carregarCapitulo(capituloAtual);
        
        // Rolar para o topo da página
        window.scrollTo(0, 0);
    }
}

// Carregar conteúdo de um capítulo específico
function carregarCapitulo(numeroCapitulo) {
    if (!livroAtual) return;
    
    // Atualizar estado visual dos botões de capítulos
    atualizarBotoesCapitulos(numeroCapitulo);
    
    // Obter dados do capítulo
    const capitulo = livroAtual.capitulos.find(cap => cap.numero === numeroCapitulo);
    
    if (!capitulo) {
        conteudoTexto.innerHTML = '<p>Capítulo não encontrado.</p>';
        return;
    }
    
    // Atualizar informações do capítulo
    const totalCapitulos = livroAtual.capitulos.length;
    infoCapitulo.textContent = `${livroAtual.nome} - Capítulo ${numeroCapitulo} de ${totalCapitulos}`;
    
    // Atualizar estado dos botões de navegação
    btnCapituloAnterior.disabled = numeroCapitulo <= 1;
    btnProximoCapitulo.disabled = numeroCapitulo >= totalCapitulos;
    
    // Renderizar versículos
    renderizarVersiculos(capitulo);
    
    // Atualizar URL com hash para permitir compartilhamento direto
    window.location.hash = `${abreviacaoAtual}-${numeroCapitulo}`;
}

// Atualizar estado visual dos botões de capítulos
function atualizarBotoesCapitulos(numeroAtivo) {
    document.querySelectorAll('#capitulos-container button').forEach((button, index) => {
        if (index + 1 === numeroAtivo) {
            button.classList.add('ativo');
        } else {
            button.classList.remove('ativo');
        }
    });
}

// Renderizar versículos de um capítulo
function renderizarVersiculos(capitulo) {
    conteudoTexto.innerHTML = '';
    
    if (!capitulo || !capitulo.versiculos) {
        conteudoTexto.innerHTML = '<p>Nenhum versículo encontrado.</p>';
        return;
    }
    
    capitulo.versiculos.forEach(versiculo => {
        const p = document.createElement('p');
        p.className = 'versiculo';
        
        const span = document.createElement('span');
        span.className = 'numero-versiculo';
        span.textContent = versiculo.numero;
        
        p.appendChild(span);
        p.appendChild(document.createTextNode(' ' + versiculo.texto));
        
        conteudoTexto.appendChild(p);
    });
}

// Funções auxiliares para UI
function mostrarCarregando() {
    carregandoElement.style.display = 'flex';
    conteudoBibliaElement.style.display = 'none';
}

function ocultarCarregando() {
    carregandoElement.style.display = 'none';
    conteudoBibliaElement.style.display = 'block';
}

function mostrarErro(mensagem) {
    erroMensagemElement.textContent = mensagem;
    erroMensagemElement.style.display = 'block';
    ocultarCarregando();
}

function ocultarErro() {
    erroMensagemElement.style.display = 'none';
}

// Verificar se há um hash na URL para navegação direta
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const [livro, capitulo] = hash.split('-');
        if (livro && capitulo) {
            carregarLivroSelecionado(livro);
            setTimeout(() => mudarCapitulo(parseInt(capitulo)), 100);
        }
    }
});
