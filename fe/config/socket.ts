import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const SOCKET_CONFIG = {
  ENDPOINT: 'http://localhost:8080/ws',
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 4000,
  HEARTBEAT_OUTGOING: 4000,
  TOPICS: {
    ADMIN_ORDERS: '/topic/admin/orders',
  },
};

/**
 * Service quản lý kết nối WebSocket (STOMP)
 */
export class SocketClient {
  private client: Client | null = null;

  constructor(private token: string | undefined) {}

  /**
   * Kết nối và đăng ký nhận tin nhắn
   * @param topic - Tên topic muốn đăng ký
   * @param onMessage - Callback xử lý dữ liệu khi nhận tin
   * @param onConnect - Callback khi kết nối thành công
   * @param onDisconnect - Callback khi mất kết nối
   */
  connect(
    topic: string,
    onMessage: (data: any) => void,
    onConnect?: () => void,
    onDisconnect?: () => void
  ) {
    if (!this.token) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_CONFIG.ENDPOINT),
      reconnectDelay: SOCKET_CONFIG.RECONNECT_DELAY,
      heartbeatIncoming: SOCKET_CONFIG.HEARTBEAT_INCOMING,
      heartbeatOutgoing: SOCKET_CONFIG.HEARTBEAT_OUTGOING,
    });

    this.client.onConnect = () => {
      onConnect?.();
      this.client?.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    };

    this.client.onDisconnect = () => onDisconnect?.();
    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      onDisconnect?.();
    };

    this.client.activate();
  }

  /**
   * Ngắt kết nối
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}
