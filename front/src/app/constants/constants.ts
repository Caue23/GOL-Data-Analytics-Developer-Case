import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConstants {
  public readonly aeroportosBrasilIATA: string[] = [
    "AFL", "AJU", "ARU", "BAU", "BEL", "BPG", "BSB", "CAC", "CGB", "CGR", "CGH", "CNF",
    "CPV", "CXJ", "CWB", "CZS", "FEN", "FLN", "FOR", "GIG", "GRU", "GYN", "IGU",
    "IMP", "IPN", "IOS", "JDF", "JDO", "JOI", "JPA", "JPR", "LDB", "MAO", "MCZ",
    "MGF", "NAT", "NVT", "OPS", "PET", "PMW", "POA", "PPB", "PVH", "RAO", "RBR", "REC",
    "RIG", "SJK", "SJP", "SLZ", "SSA", "STM", "TBT", "THE", "TFF", "UDI", "URB", "VCP",
    "VDC", "VIX", "XAP"
  ];

}
