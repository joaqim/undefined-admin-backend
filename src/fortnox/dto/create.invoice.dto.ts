import { Invoice, InvoiceRow } from "findus";

export interface CreateInvoiceDto extends Partial<Invoice> {
  CustomerNumber: string;
  InvoiceRows: InvoiceRow[];
}
