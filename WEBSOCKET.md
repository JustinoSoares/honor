# ⬡ Honor WebSocket Documentation

Esta documentação descreve como o front-end deve interagir com o servidor via WebSocket (Socket.IO).

## 📡 Detalhes da Conexão

- **URL**: `http://localhost:3000` (ou o domínio de produção)
- **Biblioteca**: `socket.io-client` v4+
- **Transports**: `websocket` (preferencial), `polling` (fallback)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});
```

---

## 🔑 Identificação do Utilizador

Após o login bem-sucedido, o front-end **deve** enviar o evento de identificação para entrar na sua "room" privada e receber notificações pessoais.

### Evento: `user:identify`

- **Payload**: `userId` (string)

```javascript
socket.emit("user:identify", user.id);
```

### Resposta: `user:ready`

O servidor confirma que o utilizador está pronto para receber eventos.

```javascript
socket.on("user:ready", ({ userId }) => {
  console.log(`Pronto para receber notificações do utilizador ${userId}`);
});
```

---

## 🔔 Notificações em Tempo Real

Sempre que uma nova notificação é criada (ex: novo convite, alteração de estado de evento, etc.), o servidor emite o evento `notification`.

### Evento: `notification`

- **Payload**: Objeto Notification

```javascript
socket.on("notification", (data) => {
  console.log("Nova notificação:", data.message);
  // data: { id, message, read, created_at, ...extra }
});
```

---

## 🎟️ Monitorização de Bilhetes

Se o front-end estiver numa página de detalhe de um bilhete/convite (ex: aguardando pagamento ou check-in), pode entrar na room do bilhete.

### Eventos: `ticket:watch` / `ticket:unwatch`

- **Payload**: `ticketId` (string)

```javascript
// Entrar na monitorização
socket.emit("ticket:watch", "uuid-do-bilhete");

// Sair da monitorização (ao sair da página)
socket.emit("ticket:unwatch", "uuid-do-bilhete");
```

---

## 📅 Monitorização de Eventos

Útil para atualizações de stock de pacotes ou lotação em tempo real.

### Evento: `event:join` / `event:leave`

- **Payload**: `eventId` (string)

```javascript
socket.emit("event:join", "uuid-do-evento");

// Resposta opcional de confirmação
socket.on("event:joined", ({ eventId }) => { ... });

socket.emit("event:leave", "uuid-do-evento");
```

---

## 📝 Resumo de Eventos

| Evento           | Direção          | Payload                                  | Descrição                                        |
| :--------------- | :--------------- | :--------------------------------------- | :----------------------------------------------- |
| `user:identify`  | Client -> Server | `userId`                                 | Identifica o utilizador e entra na room privada. |
| `user:ready`     | Server -> Client | `{ userId }`                             | Confirmação de identificação.                    |
| `notification`   | Server -> Client | `{ id, message, read, created_at, ... }` | Nova notificação recebida.                       |
| `ticket:watch`   | Client -> Server | `ticketId`                               | Entra na room de um bilhete específico.          |
| `ticket:unwatch` | Client -> Server | `ticketId`                               | Sai da room de um bilhete específico.            |
| `event:join`     | Client -> Server | `eventId`                                | Entra na room de um evento específico.           |
| `event:leave`    | Client -> Server | `eventId`                                | Sai da room de um evento específico.             |

---

## 🛠️ Dicas de Implementação

1. **Reconexão**: O Socket.IO lida com reconexão automática. Ao reconectar, certifique-se de disparar o `user:identify` novamente (o Socket.IO perde as rooms no servidor ao desconectar).
2. **Contexto Global**: No React/Vue, use um Provider ou Store global para manter a instância do socket viva durante a navegação.
3. **Segurança**: Atualmente a identificação é por ID. Em fases futuras, poderemos implementar autenticação via Token no handshake do socket.
