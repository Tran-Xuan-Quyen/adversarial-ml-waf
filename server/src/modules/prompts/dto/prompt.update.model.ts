import { PartialType } from '@nestjs/swagger';
import { PromptRequestModel } from './prompt.request.model';

export class PromptUpdateModel extends PartialType(PromptRequestModel) {}
