import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WafEvalRequestModel } from './dto/waf-eval.request.model';
import { WafEvalService, WafEvalUpstreamResponse } from './waf-eval.service';

@ApiTags('waf-eval')
@Controller('waf-eval')
export class WafEvalController {
  constructor(private readonly wafEvalService: WafEvalService) {}

  @Get()
  @ApiOperation({
    summary: 'Score one payload via ML WAF sidecar (proxy to Python serve_waf)',
  })
  async evaluateGet(@Query('payload') payload: string): Promise<WafEvalUpstreamResponse> {
    if (payload == null || String(payload).length === 0) {
      throw new BadRequestException('query parameter payload is required');
    }
    return this.wafEvalService.evaluate(payload);
  }

  @Post()
  @ApiOperation({
    summary: 'Score one payload (POST body) via ML WAF sidecar',
  })
  async evaluatePost(@Body() body: WafEvalRequestModel): Promise<WafEvalUpstreamResponse> {
    return this.wafEvalService.evaluate(body.payload);
  }
}
