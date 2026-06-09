import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as cassandra from 'cassandra-driver';
import { ConnectDto } from './dto/connect.dto';

@Injectable()
export class CassandraService implements OnModuleDestroy {
  private client: cassandra.Client | null = null;

  async connect(dto: ConnectDto): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
    }

    const options: cassandra.ClientOptions = {
      contactPoints: [`${dto.host}:${dto.port}`],
      localDataCenter: dto.localDataCenter,
    };

    if (dto.username && dto.password) {
      options.credentials = { username: dto.username, password: dto.password };
    }

    const client = new cassandra.Client(options);
    await client.connect();
    this.client = client;
  }

  getClient(): cassandra.Client {
    if (!this.client) {
      throw new Error('Not connected to Cassandra. Call POST /api/connect first.');
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}
