import { PartialType } from '@nestjs/swagger';
import { ProjectsRequestModel } from './projects.request.model';

export class ProjectsUpdateModel extends PartialType(ProjectsRequestModel) {
}
