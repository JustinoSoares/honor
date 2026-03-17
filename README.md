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