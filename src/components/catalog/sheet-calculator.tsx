"use client";

import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { HPL_SHEET_M2, parseMeters, sheetOrder } from "@/lib/area";
import { VatPrice } from "@/components/brand/vat-price";
import { formatNlNumber, inclVat } from "@/lib/format";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1 h-10 w-full border border-transparent bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none focus:border-kg-navy";

export function SheetCalculator({
  sheetM2 = HPL_SHEET_M2,
  unitExcl = 0,
  onTake,
  onOrder,
}: {
  sheetM2?: number;
  unitExcl?: number;
  onTake?: (sheets: number) => void;
  onOrder?: (sheets: number) => void;
}) {
  const [width, setWidth] = useState("6");
  const [height, setHeight] = useState("2.6");
  const [openings, setOpenings] = useState("0");
  const [taken, setTaken] = useState(false);

  const order = useMemo(() => {
    const openingValue = openings.trim() === "" ? 0 : parseMeters(openings);
    return sheetOrder({
      widthM: parseMeters(width),
      heightM: parseMeters(height),
      openingsM2: openingValue,
      sheetM2,
    });
  }, [height, openings, sheetM2, width]);

  return (
    <div className="border border-kg-lijn bg-white p-4">
      <p className="font-medium">Platen nodig</p>
      <p className="mt-1 text-[14px] leading-[1.5] text-kg-text-2">
        Een plaat is 3050 × 1300 mm, {formatNlNumber(sheetM2, 3)} m². U bestelt hele platen. Wij zagen niet op maat.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="font-mono text-[13px] text-kg-text-2">
          Breedte (m)
          <input
            value={width}
            onChange={(event) => {
              setWidth(event.target.value);
              setTaken(false);
            }}
            inputMode="decimal"
            className={fieldClass}
          />
        </label>
        <label className="font-mono text-[13px] text-kg-text-2">
          Hoogte (m)
          <input
            value={height}
            onChange={(event) => {
              setHeight(event.target.value);
              setTaken(false);
            }}
            inputMode="decimal"
            className={fieldClass}
          />
        </label>
        <label className="font-mono text-[13px] text-kg-text-2">
          Openingen (m²)
          <input
            value={openings}
            onChange={(event) => {
              setOpenings(event.target.value);
              setTaken(false);
            }}
            inputMode="decimal"
            className={fieldClass}
          />
        </label>
      </div>
      {order.ok ? (
        <p className="mt-3 font-mono text-[14px]">
          {formatNlNumber(order.netM2, 3)} m² netto / {formatNlNumber(order.sheetM2, 3)} m² = {order.sheets}{" "}
          {order.sheets === 1 ? "plaat" : "platen"}
          {unitExcl > 0 ? (
            <>
              {" · "}
              <VatPrice incl={inclVat(order.sheets * unitExcl)} excl={order.sheets * unitExcl} />
            </>
          ) : (
            ""
          )}
        </p>
      ) : (
        <p className="mt-3 border border-kg-navy px-3 py-2 text-[14px] text-kg-navy" role="alert">
          {order.error}
        </p>
      )}
      {onOrder || onTake ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {onOrder ? (
            <button
              type="button"
              disabled={!order.ok}
              onClick={() => order.ok && onOrder(order.sheets)}
              className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
            >
              Zet {order.ok ? order.sheets : ""} {order.ok && order.sheets === 1 ? "plaat" : "platen"} in bestelling
            </button>
          ) : null}
          {onTake ? (
            <button
              type="button"
              disabled={!order.ok}
              onClick={() => {
                if (!order.ok) return;
                onTake(order.sheets);
                setTaken(true);
              }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Neem over
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="mt-2 font-mono text-[13px] text-kg-text-2">
        {taken
          ? "Aantal staat bij de bestelling. Je past het nog aan voor je op de knop drukt."
          : "Je bestelt hele platen. Een reststuk blijft van jou. Wij zagen niet."}
      </p>
    </div>
  );
}
