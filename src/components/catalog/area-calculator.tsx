"use client";

import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { facadeOrder, FACADE_WASTE, parseMeters } from "@/lib/area";
import { formatNlNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1 h-10 w-full border border-transparent bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none focus:border-kg-navy";

export function AreaCalculator({
  panelsPerM2,
  lengthLabel,
  unitExcl,
  onTake,
  onOrder,
}: {
  panelsPerM2: number;
  lengthLabel: string;
  unitExcl: number;
  onTake: (panels: number) => void;
  onOrder: (panels: number) => void;
}) {
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("2.6");
  const [openings, setOpenings] = useState("0");
  const [taken, setTaken] = useState(false);

  const order = useMemo(() => {
    const openingValue = openings.trim() === "" ? 0 : parseMeters(openings);
    return facadeOrder({
      widthM: parseMeters(width),
      heightM: parseMeters(height),
      openingsM2: openingValue,
      panelsPerM2,
      waste: FACADE_WASTE,
    });
  }, [height, openings, panelsPerM2, width]);

  const wastePct = Math.round(FACADE_WASTE * 100);

  return (
    <div className="border border-kg-lijn bg-white p-4">
      <p className="font-medium">Reken uw gevel om</p>
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
          {formatNlNumber(order.grossM2, 1)} m² bruto
          {order.openingsM2 > 0 ? ` − ${formatNlNumber(order.openingsM2, 1)} m² openingen` : ""} ={" "}
          {formatNlNumber(order.netM2, 1)} m². Met {wastePct}% snijverlies: {order.panels} panelen van{" "}
          {lengthLabel} · {formatPrice(order.panels * unitExcl)} excl. btw
        </p>
      ) : (
        <p className="mt-3 border border-kg-navy px-3 py-2 text-[14px] text-kg-navy" role="alert">
          {order.error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!order.ok}
          onClick={() => order.ok && onOrder(order.panels)}
          className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
        >
          Zet {order.ok ? order.panels : ""} panelen in bestelling
        </button>
        <button
          type="button"
          disabled={!order.ok}
          onClick={() => {
            if (!order.ok) return;
            onTake(order.panels);
            setTaken(true);
          }}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Neem over
        </button>
      </div>
      <p className="mt-2 font-mono text-[13px] text-kg-text-2">
        {taken
          ? "Aantal staat bij de bestelling. Je past het nog aan voor je op de knop drukt."
          : "Ramen en deuren trek je af. Snijverlies zit in het aantal panelen."}
      </p>
    </div>
  );
}
