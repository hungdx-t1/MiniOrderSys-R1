"use client";

import { useCallback, useEffect, useState } from "react";
import type { TableResponse, ApiError } from "@/types";

interface TableMapProps {
  selectedTable: string;
  onSelect: (tableNumber: string) => void;
}

export default function TableMap({ selectedTable, onSelect }: TableMapProps) {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTables = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tables", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiError;
        setError(payload.message || "Không thể tải danh sách bàn.");
        return;
      }

      const payload = (await response.json()) as TableResponse[];
      setTables(payload);
    } catch (err) {
      setError("Không thể kết nối API bàn.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
          Sơ đồ bàn
        </h3>
        <button
          type="button"
          onClick={loadTables}
          disabled={isLoading}
          className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
        >
          {isLoading ? "Đang tải..." : "Tải lại"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-500/10 p-3 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tables.map((table) => {
          const isSelected = selectedTable === table.tableNumber;
          const isOccupied = table.status === "OCCUPIED";
          const isOutOfService = table.status === "OUT_OF_SERVICE";
          const isAvailable = table.status === "AVAILABLE";

          // Xác định màu sắc dựa trên trạng thái
          let statusStyles = "";
          if (isAvailable) {
            statusStyles = isSelected 
              ? "bg-emerald-500 border-emerald-600 shadow-emerald-500/20 text-white" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20";
          } else if (isOccupied) {
            statusStyles = "bg-rose-500/10 border-rose-500/20 text-rose-600 cursor-not-allowed opacity-75";
          } else {
            statusStyles = "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 cursor-not-allowed opacity-50";
          }

          return (
            <button
              key={table.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(table.tableNumber)}
              className={`relative flex h-24 flex-col items-center justify-center rounded-2xl border px-3 py-4 transition-all duration-300 ${statusStyles} ${
                isSelected ? "scale-105 shadow-lg" : "scale-100 shadow-sm"
              }`}
            >
              <span className="font-display text-xl font-bold">
                {table.tableNumber}
              </span>
              <span className="mt-1 text-[10px] font-medium opacity-80 uppercase tracking-tighter">
                {isOccupied ? "Đang có khách" : isOutOfService ? "Bảo trì" : `Sức chứa: ${table.capacity}`}
              </span>

              {isSelected && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-sm ring-2 ring-white">
                   <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5L3.5 7L9 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
