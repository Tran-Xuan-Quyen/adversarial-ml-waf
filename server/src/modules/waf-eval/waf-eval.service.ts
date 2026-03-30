import { HttpException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface WafEvalUpstreamResponse {
  blocked: boolean;
  pred: number;
  attack_score: number;
  label: string;
}

@Injectable()
export class WafEvalService {
  private readonly logger = new Logger(WafEvalService.name);

  constructor(private readonly configService: ConfigService) {}

  baseUrl(): string {
    const raw = this.configService.get<string>('WAF_SERVICE_URL') ?? 'http://127.0.0.1:8787';
    return raw.replace(/\/$/, '');
  }

  async evaluate(payload: string): Promise<WafEvalUpstreamResponse> {
    const base = this.baseUrl();
    const url = `${base}/waf`;
    const timeout = Number(this.configService.get('WAF_SERVICE_TIMEOUT_MS') ?? 30000);
    try {
      const res = await axios.get<WafEvalUpstreamResponse | { error?: string }>(url, {
        params: { payload },
        timeout,
        validateStatus: () => true,
      });
      const data = res.data;
      if (res.status >= 400) {
        const err = typeof data === 'object' && data && 'error' in data ? (data as { error: string }).error : 'upstream_error';
        throw new HttpException(err, res.status >= 500 ? 502 : res.status);
      }
      if (typeof data === 'object' && data && 'error' in data) {
        throw new HttpException((data as { error?: string }).error ?? 'upstream_error', 502);
      }
      return data as WafEvalUpstreamResponse;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const ax = e as AxiosError;
        if (ax.code === 'ECONNREFUSED' || ax.code === 'ETIMEDOUT') {
          this.logger.warn(`WAF sidecar unreachable: ${base}`);
          throw new ServiceUnavailableException(
            'ML WAF service is not running. Start ml-waf-adversarial-eval/serve_waf.py or set WAF_SERVICE_URL.',
          );
        }
      }
      throw e;
    }
  }
}
