import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  phone?: string;

  @Expose()
  address?: string;

  @Expose()
  email: string;
}
