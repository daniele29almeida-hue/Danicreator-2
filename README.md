# DANI CREATOR

Aplicativo web responsivo de biblioteca de prompts, com sincronização em tempo real via Supabase.

## Recursos
- Interface preta e rosa.
- Cadastro, edição e exclusão de projetos.
- Até 3 prompts de imagem, 3 de vídeo e 3 de texto por projeto.
- Botões individuais para copiar cada prompt.
- Upload de capa de imagem ou vídeo.
- Busca, filtros e atualização em tempo real entre dispositivos.
- Compartilhamento do endereço do aplicativo.

## Configuração do Supabase (necessária para sincronizar)
1. Crie um projeto em https://supabase.com.
2. No painel SQL Editor, execute todo o arquivo `supabase.sql`.
3. Em Project Settings > API, copie Project URL e a chave `anon`/public.
4. Ao abrir o app, use o botão de nuvem e informe essas duas credenciais. A configuração pelo botão é salva no navegador.
5. Para publicar no Netlify, conecte este repositório e configure Build command `npm run build` e Publish directory `dist`.

## Acesso compartilhado
O SQL permite que qualquer visitante com o endereço do app leia, crie, edite e exclua projetos e envie mídias. Qualquer pessoa com o link poderá alterar ou apagar o conteúdo. Não coloque dados pessoais ou confidenciais.
A chave `anon` é pública e foi feita para uso no navegador. Nunca coloque a chave `service_role` no app.

A sincronização só funciona depois que o projeto Supabase for criado e o SQL executado. Também será necessário conectar a URL e a chave pública no app.
