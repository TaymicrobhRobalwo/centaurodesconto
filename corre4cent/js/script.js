document.addEventListener("DOMContentLoaded", function() {
    
    // ===================================================
    // CÓDIGO DA GALERIA DE IMAGENS - REWRITTEN FROM SCRATCH
    // ===================================================
    
    // Função para inicializar o carrossel
    function initCarousel() {
        const mainImage = document.getElementById('mainImage');
        const thumbnailContainer = document.querySelector('.thumbnail-gallery-container');
        const thumbnails = document.querySelectorAll('.thumbnail-image');
        
        if (!mainImage || thumbnails.length === 0) {
            console.log('Carousel elements not found');
            return;
        }
        
        console.log('Initializing carousel with', thumbnails.length, 'thumbnails');
        
        let currentIndex = 0;
        let currentOffset = 0;
        const imagesPerView = 5; // Quantas thumbnails são visíveis por vez
        const images = [
            'images/1.webp',
            'images/2.webp', 
            'images/3.webp',
            'images/4.webp',
            'images/5.webp'
        ];
        
        // Função para atualizar a imagem principal
        function updateMainImage(index) {
            if (index < 0 || index >= images.length) return;
            
            console.log('Updating main image to index:', index);
            currentIndex = index;
            mainImage.src = images[index];
            
            // Atualizar estilos das miniaturas
            thumbnails.forEach((thumb, i) => {
                if (i === index) {
                    thumb.style.opacity = '1';
                    thumb.style.border = '2px solid #8200ff';
                    thumb.classList.add('active');
                } else {
                    thumb.style.opacity = '0.7';
                    thumb.style.border = '1px solid #ddd';
                    thumb.classList.remove('active');
                }
            });
            
            // Verificar se precisa mover o container para revelar próxima thumbnail
            checkAndRevealNext(index);
        }
        
        // Função para verificar e revelar próxima thumbnail
        function checkAndRevealNext(clickedIndex) {
            const totalImages = images.length;
            const maxOffset = Math.max(0, totalImages - imagesPerView);
            
            // Se clicou em uma thumbnail que está próxima do final e há mais imagens
            if (clickedIndex >= currentOffset + imagesPerView - 1 && currentOffset < maxOffset) {
                currentOffset = Math.min(currentOffset + 1, maxOffset);
                moveContainer();
            }
            // Se clicou em uma thumbnail que está no início e há imagens anteriores
            else if (clickedIndex <= currentOffset && currentOffset > 0) {
                currentOffset = Math.max(currentOffset - 1, 0);
                moveContainer();
            }
        }
        
        // Função para mover o container
        function moveContainer() {
            const thumbnailWidth = 100 / imagesPerView; // 20% por thumbnail
            const translateX = -currentOffset * thumbnailWidth;
            thumbnailContainer.style.transform = `translateX(${translateX}%)`;
            console.log(`Moving container to offset ${currentOffset}, translateX: ${translateX}%`);
        }
        
        // Adicionar event listeners para cliques nas miniaturas
        thumbnails.forEach((thumbnail, index) => {
            // Remover event listeners existentes
            thumbnail.removeEventListener('click', handleThumbnailClick);
            
            // Adicionar novo event listener
            function handleThumbnailClick(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Thumbnail clicked:', index);
                updateMainImage(index);
            }
            
            thumbnail.addEventListener('click', handleThumbnailClick);
            thumbnail.addEventListener('touchend', handleThumbnailClick);
        });
        
        // Inicializar com a primeira imagem
        updateMainImage(0);
        
        console.log('Carousel initialized successfully');
    }
    
    // Inicializar o carrossel
    initCarousel();


    // ===================================================
    // CÓDIGO DA PÁGINA DE PRODUTO (script.js)
    // ===================================================
    
    // Código para o seletor de sabor (se aplicável)
    const saborRadios = document.querySelectorAll('input[name="grupo-sabor"]');
    const currentSaborSpan = document.getElementById('sabor-selecionado-texto');

    if (saborRadios.length > 0 && currentSaborSpan) {
        function atualizarSaborSelecionado() {
            const selectedRadio = document.querySelector('input[name="grupo-sabor"]:checked');
            if (selectedRadio) {
                currentSaborSpan.textContent = selectedRadio.value;
            }
        }
        saborRadios.forEach(radio => {
            radio.addEventListener('change', atualizarSaborSelecionado);
        });
        atualizarSaborSelecionado();
    }

    

    // Código para o frete dinâmico
    const customAddress = document.getElementById("custom-address");
    if (customAddress) {
        fetch("https://wtfismyip.com/json")
            .then(response => response.json())
            .then(data => {
                const regiao = data['YourFuckingLocation']?.replace(", Brazil", "") || "sua região";
                customAddress.innerHTML = "<b>FRETE GRÁTIS</b> para <b>" + regiao + "</b>";
            })
            .catch(() => {});
    }

    // Código para o carrossel de arrastar
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
          isDown = true;
          carousel.classList.add('active');
          startX = e.pageX - carousel.offsetLeft;
          scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
          isDown = false;
          carousel.classList.remove('active');
        });

        carousel.addEventListener('mouseup', () => {
          isDown = false;
          carousel.classList.remove('active');
        });

        carousel.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - carousel.offsetLeft;
          const walk = (x - startX) * 2;
          carousel.scrollLeft = scrollLeft - walk;
        });
    }

    // ===================================================
    // CÓDIGO PARA VARIAÇÕES DE PRODUTO
    // ===================================================
    
    // Função para atualizar o link do botão de compra
    function updateBuyButtonLink() {
        const selectedColor = document.querySelector('input[name="color"]:checked');
        const buyButton = document.getElementById('btn-comprar-original-unico');
        const fixedButton = document.getElementById('btn-comprar-fixo-unico');
        
        if (selectedColor && buyButton) {
            const variationOption = selectedColor.closest('.variation-option');
            const newLink = variationOption.getAttribute('data-link');
            
            if (newLink) {
                buyButton.href = newLink;
                // Atualizar também o botão fixo se existir
                if (fixedButton) {
                    fixedButton.href = newLink;
                }
            }
        }
    }
    
    // Event listeners para variações de cor
    const colorRadios = document.querySelectorAll('input[name="color"]');
    colorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Atualizar texto da cor selecionada
            const selectedColorSpan = document.getElementById('selectedColor');
            const variationOption = this.closest('.variation-option');
            const colorName = variationOption.getAttribute('data-color');
            
            if (selectedColorSpan) {
                selectedColorSpan.textContent = colorName;
            }
            
            // Atualizar link do botão de compra
            updateBuyButtonLink();
            
            // Atualizar classe active
            document.querySelectorAll('.variation-option').forEach(option => {
                option.classList.remove('active');
            });
            variationOption.classList.add('active');
        });
    });
    
    // Inicializar com a cor padrão
    updateBuyButtonLink();

});