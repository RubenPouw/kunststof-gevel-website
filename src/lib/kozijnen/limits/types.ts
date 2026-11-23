/** Gepubliceerde productgrenzen in millimeters. Een ontbrekend veld is niet gepubliceerd. */
export type SizeBox = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Maximale breedte van één draaiend of schuivend vak, in mm. */
  maxSashWidth?: number;
};
