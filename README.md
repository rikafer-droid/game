**Objetivo:** Crie um jogo de tiro espacial (shmup) de tela fixa inspirado no clássico "Megamania" do Atari. O jogador controla uma nave na parte inferior da tela que se move apenas horizontalmente.

**Mecânicas Principais:**

- **Controle do Jogador:** Movimentação lateral fluida (Esquerda/Direita) e disparo de projéteis verticais. Os projéteis devem ser rápidos.
- **Barra de Energia:** Implemente uma barra que diminui constantemente. Destruir uma onda completa de inimigos recupera a barra. Se a barra chegar a zero, o jogador perde uma vida. Quando muda de fase a barra de energia é renovada.
- **Inimigos:** Os inimigos devem aparecer no topo da tela em padrões de zigue-zague e descendo em fileiras devagar. Eles atiram poucos projéteis, um de cada vez e o contato com eles destrói a nave do jogador.
- **Ondas de Inimigos (Sprites):** Alterne o visual dos inimigos a cada nível:
    - Hambúrgueres voadores.
    - Bolachas/Biscoitos.
    - Ferros de passar roupa.
    - Gravatas borboleta.
    - Diamantes.

**Estética e Áudio:**

- **Visual:** Estilo Pixel Art de baixa resolução (8-bit), cores vibrantes sobre um fundo preto sólido.
- **Efeitos Sonoros:** Som de "laser" agudo ao atirar e um som de explosão "crushing" quando o inimigo é atingido.
- **Interface:** Mostre o Score no topo e a barra de energia/combustível na parte inferior.

**Lógica de Jogo:**

- A cada nível vencido, a velocidade dos inimigos aumenta.
- O sistema de colisão deve ser preciso para o estilo arcade.

**Saída:**

- O game se adaptar para rodar no desktop e mobile

Crie o projeto na raiz da pasta

Crie o plano de implementação
