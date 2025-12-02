// ====== LISTA DE PRODUTOS ======
// Aqui estão os dinossauros disponíveis para compra.
// Cada objeto contém nome, preço, imagem e descrição.
const produtos = [
  {nome:'Giganotosaurus', preco:3500, img:'imagens/giga.png', desc:'Uma das criaturas mais poderosas do Ark.'},
  {nome:'Tyrannosaurus Rex', preco:2900, img:'imagens/rex.jpg', desc:'O rei dos predadores, forte e resistente.'},
  {nome:'Ankylosaurus', preco:1800, img:'imagens/ankylo.webp', desc:'Forte e durável, perfeito para coleta.'},
  {nome:'Rock Drake', preco:2500, img:'imagens/drake.jpg', desc:'Ágil e camuflado, domina terrenos e paredes.'},
  {nome:'Spinosaurus', preco:3200, img:'imagens/spino.jpg', desc:'Caçador aquático feroz e poderoso.'},
  {nome:'Triceratops', preco:2100, img:'imagens/trike.jpg', desc:'Herbívoro resistente, ótimo para transporte.'}
];

// ====== EXIBE OS PRODUTOS NA PÁGINA ======
// Cria os cards de produto dinamicamente dentro do elemento "product-grid".
const grid = document.getElementById('product-grid');
if (grid) {
  grid.innerHTML = produtos.map(p => `
    <div class="col-md-4 d-flex">
      <div class="card w-100">
        <div class="card-body">
          <h5 class="card-title">${p.nome}</h5>
          <img src="${p.img}" alt="${p.nome}">
          <p class="mb-1">${p.desc}</p>
          <p class="price">R$ ${p.preco.toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
          <button class="btn btn-success add-cart" data-name="${p.nome}" data-price="${p.preco}">Adicionar ao Carrinho</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ====== VARIÁVEIS DO CARRINHO ======
// Aqui pegamos os principais elementos do carrinho e da interface.
const cartIcon = document.getElementById('cart-icon');
const cartPanel = document.getElementById('cart');
const closeCart = document.getElementById('close-cart');
const ul = document.getElementById('cart-items');
const emptyMsg = document.getElementById('empty-cart');
const totalEl = document.getElementById('cart-total');
const countEl = document.getElementById('cart-count');
const clearBtn = document.getElementById('clear-cart');
const alertBox = document.getElementById('alert');
const overlay = document.getElementById('cart-overlay');

// ====== RECUPERA OU CRIA O CARRINHO NO NAVEGADOR ======
let cart = JSON.parse(localStorage.getItem('dinoCartV2') || '{}');

// Função que salva o carrinho no armazenamento local (localStorage)
function saveCart(){ localStorage.setItem('dinoCartV2', JSON.stringify(cart)); }

// Converte número em formato monetário brasileiro
function money(n){ return n.toLocaleString('pt-BR',{minimumFractionDigits:2}); }

// Calcula a quantidade total de itens e o valor total do carrinho
function getTotals(){
  let qty = 0, total = 0;
  Object.values(cart).forEach(it => { qty += it.qty; total += it.qty * it.price; });
  return {qty,total};
}

// Atualiza a lista de produtos e o total na interface
function renderCart(){
  if (!ul || !totalEl || !countEl) return;
  ul.innerHTML = '';
  const names = Object.keys(cart);

  // Se o carrinho estiver vazio, mostra a mensagem
  if(!names.length){
    emptyMsg && (emptyMsg.style.display = 'block');
  } else {
    emptyMsg && (emptyMsg.style.display = 'none');
    names.forEach(name=>{
      const it = cart[name];
      const subtotal = it.qty * it.price;
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="item-name">${name}</div>
          <small>R$ ${money(it.price)} un. • Subtotal: R$ ${money(subtotal)}</small>
        </div>
        <div class="item-controls">
          <div class="qty-box">
            <!-- Botões para aumentar/diminuir quantidade -->
            <button class="btn btn-sm btn-outline-secondary minus" data-name="${name}" title="Diminuir"><i class="bi bi-dash-lg"></i></button>
            <input type="number" class="form-control form-control-sm qty-input" min="1" value="${it.qty}" data-name="${name}">
            <button class="btn btn-sm btn-outline-secondary plus" data-name="${name}" title="Aumentar"><i class="bi bi-plus-lg"></i></button>
          </div>
          <!-- Botão para remover o item -->
          <button class="remove-item" title="Remover" data-name="${name}"><i class="bi bi-trash3"></i></button>
        </div>
      `;
      ul.appendChild(li);
    });
  }

  // Atualiza quantidade e valor total na interface
  const {qty,total} = getTotals();
  countEl.textContent = qty;
  totalEl.textContent = money(total);
}

// Mostra um pequeno alerta verde quando adiciona um item
function showAlert(){
  if(!alertBox) return;
  alertBox.classList.add('show');
  setTimeout(()=>alertBox.classList.remove('show'),1200);
}

// ====== FUNÇÕES PRINCIPAIS DO CARRINHO ======

// Adiciona um item ao carrinho
function addItem(name, price){
  if(!cart[name]) cart[name] = {price: Number(price), qty: 0};
  cart[name].qty += 1;
  saveCart();
  renderCart();
  showAlert(); // Mostra aviso, mas NÃO abre o carrinho automaticamente
}

// Define manualmente a quantidade de um item
function setQty(name, qty){
  qty = Math.max(1, Number(qty)||1);
  if(cart[name]){ cart[name].qty = qty; saveCart(); renderCart(); }
}

// Aumenta ou diminui a quantidade do produto
function changeQty(name, delta){
  if(cart[name]){
    cart[name].qty += delta;
    if(cart[name].qty <= 0) delete cart[name];
    saveCart(); renderCart();
  }
}

// Remove um item específico
function removeItem(name){ delete cart[name]; saveCart(); renderCart(); }

// Limpa todo o carrinho
function clearCart(){ cart = {}; saveCart(); renderCart(); }

// ====== EVENTOS DE ABRIR/FECHAR O CARRINHO ======

// Ao clicar no ícone, abre ou fecha o carrinho
if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    cartPanel.classList.toggle('open');
    overlay.classList.toggle('show');
  });
}

// Fecha o carrinho ao clicar no botão de fechar (X)
if (closeCart) {
  closeCart.addEventListener('click', () => {
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// Fecha o carrinho ao clicar fora dele (no fundo escuro)
if (overlay) {
  overlay.addEventListener('click', () => {
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ====== ADIÇÃO DE ITENS ======
// Usa "delegação de eventos" para detectar cliques em botões "Adicionar ao Carrinho"
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.add-cart');
  if(btn){
    const name = btn.getAttribute('data-name');
    const price = Number(btn.getAttribute('data-price'));
    addItem(name, price);
  }
});

// ====== EVENTOS DENTRO DO CARRINHO ======
// Aumentar, diminuir e remover produtos
if (ul) {
  ul.addEventListener('click', (e)=>{
    const minus = e.target.closest('.minus');
    const plus  = e.target.closest('.plus');
    const remove= e.target.closest('.remove-item');
    if(minus){ changeQty(minus.getAttribute('data-name'), -1); }
    else if(plus){ changeQty(plus.getAttribute('data-name'), +1); }
    else if(remove){ removeItem(remove.getAttribute('data-name')); }
  });

  // Quando o usuário altera o número diretamente no input
  ul.addEventListener('change', (e)=>{
    const input = e.target.closest('.qty-input');
    if(input){ setQty(input.getAttribute('data-name'), input.value); }
  });
}

// Botão de "Esvaziar Carrinho"
if (clearBtn) clearBtn.addEventListener('click', clearCart);

// ====== INICIALIZA O CARRINHO NA TELA ======
renderCart();

// ====== FORMULÁRIO DE CONTATO ======
// Quando o usuário envia a mensagem, mostra um alerta simpático
const form = document.getElementById('contactForm');
if(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    alert('Mensagem enviada com sucesso! 🦕 A equipe DinoShop entrará em contato em breve.');
    this.reset(); // limpa o formulário
  });
}

// ====== TEMA CLARO/ESCURO ======
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

// Verifica se o modo escuro estava ativo anteriormente
let darkMode = localStorage.getItem('darkMode') === 'true';

// Aplica o tema de acordo com o estado atual
function applyTheme() {
  document.body.classList.toggle('dark-mode', darkMode);
  if (themeIcon) {
    themeIcon.classList.toggle('bi-sun', !darkMode);
    themeIcon.classList.toggle('bi-moon', darkMode);
  }
  if (themeText) themeText.textContent = darkMode ? 'Modo Escuro' : 'Modo Claro';
}

// Aplica o tema assim que o site carrega
applyTheme();

// Ao clicar no botão, alterna entre claro e escuro
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
  });
}

// ====== FECHAR CARRINHO AO FINALIZAR COMPRA ======
// Quando o usuário clica em "Finalizar Compra", o carrinho é fechado
document.addEventListener('click', (e) => {
  const finalizarBtn = e.target.closest('[data-bs-target="#confirmModal"]');
  if (finalizarBtn) {
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }
});
