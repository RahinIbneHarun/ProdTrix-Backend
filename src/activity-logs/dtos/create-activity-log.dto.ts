
export class CreateActivityLogDto {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
}
