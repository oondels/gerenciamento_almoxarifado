export interface CreateProductDTO {
  name: string;
  category: string;
  codigo?: string;
  serial_number?: string;
  minimal_quantity?: number;
  quantity?: number;
  value?: number;
  local_storage?: string;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  codigo?: string;
  serial_number?: string;
  minimal_quantity?: number;
  quantity?: number;
  value?: number;
  local_storage?: string;
}
