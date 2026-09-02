from pydantic import BaseModel


class PrinterResponse(BaseModel):
    printer_id: str
    outlet_id: str
    name: str

    status: str
    paper_status: str
    connection_status: str

    last_successful_print: str | None = None


class PrinterStatusResponse(BaseModel):
    printer_id: str
    status: str
    paper_status: str
    connection_status: str
    last_successful_print: str | None = None