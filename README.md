# Honor

API para o projecto de convites digitais para eventos

## Fluxo

Nosso pessoal cria conta.
|
Qualquer empresa se quiser os nosso serviços poderá preencher um formulário, posteriormente nós vamos entrar em contacto, para confirmacao e tal.
|
Nosso pessoal cria um evento associado a uma pessoa.
|
Nosso pessoal faz a abertura de vendas.
|
O Client solicita o convite colocando (email, telefone, e o seu nome).
|
O convite é logo enviado no seu email ou whatsapp ou lhe é enviado um link no email para poder acessar e baixar o seu convite único.
|
O Client chega no evento, o qr-code é scanneado e a sua entrada é verificada.

## Endpointes pesperados

Gerenciamento de usuarios admin
criate, update, list, each

Gerenciamento de eventos, os eventos precisam ser criados
associados a uma pessoa, para ela poder receber sempre relatorios

### Fluxo de compra de ingresso

Os clients acessam o site
|
Escolher o ingresso
|
Dizer a quantidade de ingresso
|
Vamos ter o total em dinheiro
|
O client fechar o total e paga
|
mandamos o link do convite convite

## fluxo para hoje

Organizador cria evento - GOOD
↓
Sistema publica evento no site - GOOD
↓
Cliente compra ingresso -- PROGRESS
↓
Pagamento confirmado
↓
Sistema gera ticket (QR Code)
↓
Cliente recebe email com link
↓
Cliente baixa convite
↓
No evento: app escaneia QR
↓
API valida ticket x
↓
Entrada autorizada ou negada

obs: vai se poder criar categoria do evento (se é vip, normal)

## Novo fluxo

Qualquer pessoas antes de criar um evento deve ter uma conta criada (nome, email, telefone, e senha). $
|
Essa mesma pessoa pode adicionar ou ser adicionado como membro gerente desse evento. (master, manager) $
|
O usuário pode criar um determinado evento depois esse evento precisa ser verificado pela nossa equipa, só assim ele fica disponível para o público. $
k |
A criação do evento é free mas ele pode pagar X na plataforma para ter o seu evento como prioridade sempre, mesmo nas pesquisas e na capa. classificacao a b e c $
|
Um membro manager é responsável por controlar um evento podendo scannear o qrcode e ver o histórico de entradas no evento.
|
Um membro master de um vento poderá acompanhar o processo todo em tempo real adicionar manegers remover, editar dados do evento bloqueiar pessoas do evento, ver o valor e quantas compras foram feitas.
|
estes mesmos usuários vão poder fazer autenticação (senha e email e google)
|
Os convidados terão acesso a todos eventos disponíveis na plataforma
|
Podem selecionar um evento especificando a quantidade de convites e lhe é calculado o preço dependendo do pacote.
|
Quem quiser um convite deve informar o seu (nome, email, telefone e finalizar o pagamento).
|
Lhe será enviado um email com um código e esse código expira em uma dia
|
com o código e email, ele pode ter acesso ao seu convite e baixar sempre que precisar e pode sempre solicitar o seu convite para baixar como imagem.
