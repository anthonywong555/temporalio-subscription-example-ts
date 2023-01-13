import 'dotenv/config';
import { Connection, WorkflowClient } from '@temporalio/client';
import fs from 'fs';

export class TemporalClientSingleton {
  private static instance: WorkflowClient;

  private constructor() {}

  public static async getInstance(): Promise<WorkflowClient> {
    if(!this.instance) {
      const env = TemporalClientSingleton.getEnv();
      const {
        address,
        namespace,
        clientCertPath,
        clientKeyPath,
        serverNameOverride,
        serverRootCACertificatePath,
        isMTLS
      } = env;
    
      let connection;
    
      // Check to see if you are connection to Temporal Cloud or Temporal Local
      if(isMTLS) {
        let serverRootCACertificate: Buffer | undefined = undefined;
        if (serverRootCACertificatePath) {
          serverRootCACertificate = fs.readFileSync(serverRootCACertificatePath);
        }
    
        connection = await Connection.connect({
          address,
          tls: {
            serverNameOverride,
            serverRootCACertificate,
            clientCertPair: {
              crt: fs.readFileSync(clientCertPath),
              key: fs.readFileSync(clientKeyPath),
            },
          },
        });
      } else {
        connection = await Connection.connect();
      }
    
      this.instance = new WorkflowClient({ connection, namespace }); 
    }

    return this.instance;
  }

  private static requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new ReferenceError(`${name} environment variable is not defined`);
    }
    return value;
  }

  private static getEnv(): Env {
    return {
      address: this.requiredEnv('TEMPORAL_ADDRESS'),
      namespace: this.requiredEnv('TEMPORAL_NAMESPACE'),
      clientCertPath: this.requiredEnv('TEMPORAL_CLIENT_CERT_PATH'),
      clientKeyPath: this.requiredEnv('TEMPORAL_CLIENT_KEY_PATH'),
      serverNameOverride: process.env.TEMPORAL_SERVER_NAME_OVERRIDE,
      serverRootCACertificatePath: process.env.TEMPORAL_SERVER_ROOT_CA_CERT_PATH,
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'hello-world-mtls',
      isMTLS: this.requiredEnv('MTLS') === 'true'
    };
  }
}

export interface Env {
  address: string;
  namespace: string;
  clientCertPath: string;
  clientKeyPath: string;
  serverNameOverride?: string; // not needed if connecting to Temporal Cloud
  serverRootCACertificatePath?: string; // not needed if connecting to Temporal Cloud
  taskQueue: string;
  isMTLS: boolean
}