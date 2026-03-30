import { Module } from '@nestjs/common';
import { WafEvalController } from './waf-eval.controller';
import { WafEvalService } from './waf-eval.service';

@Module({
  controllers: [WafEvalController],
  providers: [WafEvalService],
  exports: [WafEvalService],
})
export class WafEvalModule {}
