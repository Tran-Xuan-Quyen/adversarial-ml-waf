import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class RsaKeyService implements OnModuleInit {
  readonly privateKeyPath: string = 'key/private-key.pem';
  readonly publicKeyPath: string = 'key/public-key.pem';
  onModuleInit() {
    console.log('Module has been initialized. Generating RSA keys...');
    this.checkAndGenerateRSAKeyPair();
  }
  public checkAndGenerateRSAKeyPair() {
    if (
      !fs.existsSync(this.privateKeyPath) ||
      !fs.existsSync(this.publicKeyPath)
    ) {
      this.generateRSAKeyPair();
      return;
    } else {
      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      const publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
      if (
        !this.isValidRsaKey(privateKey, 'private') ||
        !this.isValidRsaKey(publicKey, 'public')
      ) {
        this.generateRSAKeyPair();
      }
      return;
    }
  }

  public generateRSAKeyPair() {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Độ dài modulus (độ an toàn của key)
        publicKeyEncoding: {
          type: 'pkcs1', // Định dạng xuất khóa
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      });
      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);
    } catch (err) {
      console.log(err);
    }
  }

  private isValidRsaKey(key: string, keyType: 'public' | 'private'): boolean {
    try {
      if (keyType === 'public') {
        crypto.createPublicKey({
          key,
          format: 'pem',
          type: 'pkcs1',
        });
      }
      if (keyType === 'private') {
        crypto.createPrivateKey({
          key,
          format: 'pem',
          type: 'pkcs1',
        });
      }
      return true;
    } catch (err) {
      console.log(`Invalid key: ${err.message}`);
      return false;
    }
  }
}
