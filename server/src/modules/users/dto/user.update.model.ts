import { PartialType } from "@nestjs/swagger";
import { UserRequestModel } from "./user.request.model";

export class UserUpdateModel extends PartialType(UserRequestModel) {

}
