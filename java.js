const productos = [
    { id: 1, nombre: "El Quijote", precio: 20, categoria: "novela", img: "img/quijote.jpg" },
    { id: 2, nombre: "Harry Potter y la Piedra Filosofal", precio: 15, categoria: "fantasia", img: "img/harry.jpg" },
    { id: 3, nombre: "Historia del Mundo", precio: 25, categoria: "historia", img: "img/historia.jpg" },
    { id: 4, nombre: "El Hobbit", precio: 18, categoria: "fantasia", img: "img/hobbit.jpg" },
    { id: 5, nombre: "1984", precio: 12, categoria: "novela", img: "img/1984.jpg" }
];

let carrito = [];
let usuario = null;

function mostrarProductos(lista) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    lista.forEach(p => {
        grid.innerHTML += `
            <div class="product">
                <img src="${p.img}">
                <h3>${p.nombre}</h3>
                <p>${p.precio} €</p>
                <button onclick="agregarCarrito(${p.id})">Añadir</button>
            </div>
        `;
    });
}

mostrarProductos(productos);

function agregarCarrito(id) {
    carrito.push(id);
    actualizarCarrito();
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function actualizarCarrito() {
    const lista = document.getElementById("carritoLista");
    lista.innerHTML = "";

    let total = 0;

    carrito.forEach((id, index) => {
        const p = productos.find(x => x.id === id);
        total += p.precio;

        lista.innerHTML += `
            <li>
                ${p.nombre} - ${p.precio}€
                <button onclick="eliminarItem(${index})">X</button>
            </li>
        `;
    });

    document.getElementById("total").textContent = total;
    document.getElementById("cartCount").textContent = carrito.length;
}

function toggleCarrito() {
    const box = document.getElementById("carritoBox");
    box.style.display = box.style.display === "block" ? "none" : "block";
}

function filtrarCategoria() {
    const cat = document.getElementById("categoryFilter").value;
    if (cat === "all") mostrarProductos(productos);
    else mostrarProductos(productos.filter(p => p.categoria === cat));
}

function ordenarPrecio() {
    mostrarProductos([...productos].sort((a, b) => a.precio - b.precio));
}

function abrirLogin() {
    document.getElementById("loginModal").style.display = "block";
}

function cerrarLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function login() {
    const input = document.getElementById("userInput").value;
    if (input.trim() === "") return alert("Introduce un nombre");

    usuario = input;
    document.getElementById("userStatus").textContent = "Bienvenido, " + usuario;
}
