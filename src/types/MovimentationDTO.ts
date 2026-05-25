export type MovimentationType = 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'loan';

export interface CreateMovimentationDTO {
  type: MovimentationType;
  product_id: string;
  movimented_by: number;
  quantity: number;
  local_storage?: string;
  appointment?: string;
  destination_type?: string;
  destination_value?: string;
}
