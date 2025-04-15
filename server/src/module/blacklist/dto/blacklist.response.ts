import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BlacklistResponse {
  @Expose()
  id: string;
  @Expose()
  account_id: string;
  @Expose()
  status: number;
}
