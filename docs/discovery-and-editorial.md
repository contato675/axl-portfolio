# Revisão editorial, vídeos e leitura por agentes

## Checklist implementado
- [x] Badge inicial: Rapper · Compositor / Rapper · Songwriter, sem RUADOFLOW.
- [x] Resumo português exatamente como enviado; versão inglesa equivalente com RUADOFLOW collective.
- [x] Biografia identifica A.X.L. como brasileiro e RUADOFLOW como coletivo na abertura e no fechamento.
- [x] Subtítulo sobre carregamento do player removido, sem remover o clique necessário para reprodução.
- [x] Todos os 15 vídeos usam miniaturas 16:9 e preenchem o card; moldura da interface preta, sem faixas cinzas laterais.
- [x] Mais clipes começa aberto em ambos os idiomas, inclusive sem JavaScript; pode ser fechado e reaberto.
- [x] Fechar Mais clipes remove os players internos para não manter áudio escondido; reabrir restaura os posters e permite novo clique.
- [x] Contato atualizado para ruadoflow@gmail.com em HTML, Markdown, texto consolidado e dados estruturados.
- [x] Link da SSSOM removido do rodapé; o arquivo de origem do retrato permanece somente como proveniência interna.
- [x] Referência Rolling Stone Brasil incluída em Fontes a partir de uma lista compartilhada entre HTML, Markdown e JSON-LD.
- [x] JSON-LD musical inserido no HTML com hash CSP exato, sem permitir scripts inline arbitrários; identidade e discos correspondem ao conteúdo visível.
- [x] Links TRIZ, demais destinos de escuta, datas do documento, títulos, créditos e originais preservados.

## Imagens e fonte editorial
14 miniaturas foram obtidas em 1280 × 720 e uma em 320 × 180. O seletor rejeita thumbnails inválidas ou placeholders retornados com HTTP 200 e prioriza uma versão widescreen real. Somente derivados destinados ao site são substituídos. As faixas pretas já presentes na fotografia/cinematografia original não são removidas por zoom ou distorção.
A Rolling Stone respondeu HTTP 403 durante a consulta. Seu link foi incluído conforme pedido do artista; não foram inferidos texto, data ou alegações do conteúdo indisponível.

## Descoberta: o que está ativo no preview
`llms.txt` aponta para os documentos Markdown. `llms-full.txt` reúne o conteúdo bilíngue. Cada página HTML identifica suas alternativas e o documento llms correspondente. O gerador usa a mesma biografia, contato, referências e catálogo nas representações visuais e textuais.
O preview permanece com `noindex,follow` e sitemap vazio, sem cadastrar páginas não aprovadas para indexação. O robots gerado permite leitura por buscadores/OAI-SearchBot e separa o bloqueio solicitado ao GPTBot. Permitir leitura é necessário para que o robô veja o noindex; robots.txt não é controle de acesso nem licença autoral.
**A cópia dentro de /axl-portfolio/ não governa o host GitHub.** O endereço efetivo `https://contato675.github.io/robots.txt` retornou 404 nesta revisão. Portanto não se afirma que a regra GPTBot desta cópia já esteja aplicada pelo domínio. `llms.txt`, diferentemente do robots.txt, pode ser publicado em um subcaminho conforme a proposta v2.

## Preparação para axl.sssom.com
O modo de domínio continua preservando `CNAME` e caminhos na raiz. A consulta DNS desta rodada ainda não encontrou axl.sssom.com; nenhuma configuração Cloudflare ou SSSOM foi alterada.
O gerador `generate(data, hosting(true), {indexable:true, approval})` está preparado para produzir o sitemap com 36 URLs canônicas (duas páginas iniciais e 34 páginas dos 17 lançamentos), referências recíprocas EN/PT-BR/x-default e a indicação do sitemap no robots da raiz. O gerador recusa o modo indexável fora do domínio exato ou sem sign-off explícito `origin`, `editorialApproved`, `dnsVerified`, `httpsVerified` e `robotsRootVerified`. Esses campos registram conferências humanas/técnicas; não são preenchidos automaticamente por testes. O publicador de preview continua exigindo noindex e nunca ativa esse modo.
404, arquivos internos, JSON/Markdown e datas lastmod inventadas não entram no sitemap. O formato XML é testado em parser de navegador. Não há promessa de ranqueamento, leitura por um avaliador específico ou bloqueio universal de treinamento por todos os provedores.

## Fontes técnicas consultadas
- https://llmstxt.org/ — proposta v2, subcaminhos e links alternate/describedby.
- https://developers.google.com/crawling/docs/robots-txt/create-robots-txt — arquivo efetivo na raiz do host.
- https://developers.google.com/search/docs/crawling-indexing/block-indexing — crawler deve acessar a página para ler noindex.
- https://developers.google.com/search/docs/specialty/international/localized-versions — variantes de idioma e sitemap.
- https://developers.openai.com/api/docs/bots — OAI-SearchBot e GPTBot são controles independentes.

## Verificação executada
`npm run verify`: 52 testes, zero falhas; build do preview com 143 arquivos e build preparado de domínio com 144.
`npm run design:apple`: 55 verificações, zero falhas, incluindo 14 layouts e 34 modais de lançamentos.
`npm run design:editorial`: 15 verificações, zero falhas, incluindo oito layouts com os 15 posters reais, dimensões antes/depois de carregar os players, fechamento/reabertura e leitura sem JavaScript; sitemap de lançamento testado apenas com aprovação de teste.
Capturas pequenas desktop e mobile dos vídeos foram inspecionadas. Reportes, hashes e proveniência dos posters ficam nos JSON desta revisão. A checagem HTTP exata do build publicado é registrada na PR após o deploy.
Esta auditoria não é certificação Apple/WCAG nem teste em aparelhos físicos. Não se afirma que todos os vídeos foram assistidos ou reproduzem em toda região. A reprodução externa depende do YouTube.
