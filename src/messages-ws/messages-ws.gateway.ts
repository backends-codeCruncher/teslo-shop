import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;

    let payload: JWTPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //messages-from-server

    //! Emite solo al cliente que manda el mensaje.
    // client.emit('messages-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no message!!',
    // });

    //! Emitir a todos menos al cliente inicial
    // client.broadcast.emit('messages-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no message!!',
    // });

    //! Emite a todos los clientes conectados
    this.wss.emit('messages-from-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no message!!',
    });
  }
}
