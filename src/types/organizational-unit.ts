export interface OrganizationalUnit {
  id: number;
  code: string;
  name: string;
  unitType: string;
  parentId?: number | null;
  headUserId?: string | null;
  sortOrder?: number | null;
}

export interface OrgUnitPayload {
  code: string;
  name: string;
  unitType: string;
  parentId?: number;
  headUserId?: string;
  sortOrder?: number;
}
