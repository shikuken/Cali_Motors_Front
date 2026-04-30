'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import type React from "react"
import Link from "next/link"
import { ArrowLeft, Car, Filter, Gauge, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Filters {
  marca: string
  minYear: string
  maxYear: string
  minPrice: string
  maxPrice: string
  estado: string
}

interface VehicleSearchProps {
  allVehicles: any[]
  onSearchChange: (searchTerm: string, filters: Filters) => void
}

const getVehicleYear = (vehicle: any) => vehicle["a\u00f1o"] ?? vehicle["a\u00c3\u00b1o"] ?? ""

export function VehicleSearch({ allVehicles = [], onSearchChange }: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    marca: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    estado: "",
  })
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onSearchChange(searchTerm, filters)
  }, [searchTerm, filters, onSearchChange])

  const uniqueBrands = useMemo(() => [...new Set(allVehicles.map((v) => v.marca))].filter(Boolean).sort(), [allVehicles])
  const yearRange = useMemo(() => {
    if (allVehicles.length === 0) return { min: 2000, max: new Date().getFullYear() }
    const years = allVehicles.map((vehicle) => Number(getVehicleYear(vehicle))).filter(Boolean)
    return { min: Math.min(...years), max: Math.max(...years) }
  }, [allVehicles])
  const yearOptions = useMemo(() => {
    const years = []
    for (let year = yearRange.max; year >= yearRange.min; year--) years.push(year)
    return years
  }, [yearRange])
  const hasActiveFilters = Object.values(filters).some((value) => value !== "")
  const activeFiltersCount = Object.values(filters).filter((value) => value !== "").length

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      const searchLower = searchTerm.toLowerCase()
      const year = getVehicleYear(vehicle)
      const matchesSearch =
        searchTerm === "" ||
        vehicle.marca?.toLowerCase().includes(searchLower) ||
        vehicle.modelo?.toLowerCase().includes(searchLower) ||
        String(year).includes(searchLower) ||
        vehicle.descripcion?.toLowerCase().includes(searchLower)

      return (
        matchesSearch &&
        (filters.marca === "" || vehicle.marca === filters.marca) &&
        (filters.minYear === "" || Number(year) >= parseInt(filters.minYear)) &&
        (filters.maxYear === "" || Number(year) <= parseInt(filters.maxYear)) &&
        (filters.minPrice === "" || vehicle.precio >= parseInt(filters.minPrice)) &&
        (filters.maxPrice === "" || vehicle.precio <= parseInt(filters.maxPrice)) &&
        (filters.estado === "" || vehicle.estado === filters.estado)
      )
    })
  }, [allVehicles, searchTerm, filters])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clearFilters = () => setFilters({ marca: "", minYear: "", maxYear: "", minPrice: "", maxPrice: "", estado: "" })

  return (
    <div ref={searchRef} className="relative z-50 w-full lg:max-w-xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por marca, modelo, ano..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setIsOpen(true)
            }}
            onFocus={() => (searchTerm.length > 0 || hasActiveFilters) && setIsOpen(true)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:text-slate-950 focus:placeholder:text-slate-400 dark:bg-slate-800 dark:focus:bg-slate-900 dark:focus:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("")
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative h-11 rounded-2xl border-white/10 bg-white/10 px-3 text-white hover:bg-white hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-blue-600 p-0 text-xs text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 rounded-3xl border-slate-200 p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-950 dark:text-slate-100">Filtros</h4>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Limpiar todo
                  </button>
                )}
              </div>

              <FilterSelect label="Marca" value={filters.marca} placeholder="Todas las marcas" onChange={(value) => setFilters((prev) => ({ ...prev, marca: value === "all" ? "" : value }))}>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {uniqueBrands.map((brand) => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
              </FilterSelect>

              <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-300">Ano</label>
                <div className="flex gap-2">
                  <Select value={filters.minYear} onValueChange={(value) => setFilters((prev) => ({ ...prev, minYear: value === "all" ? "" : value }))}>
                    <SelectTrigger className="h-10 w-full rounded-xl dark:border-slate-700 dark:bg-slate-900"><SelectValue placeholder="Desde" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Desde</SelectItem>{yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filters.maxYear} onValueChange={(value) => setFilters((prev) => ({ ...prev, maxYear: value === "all" ? "" : value }))}>
                    <SelectTrigger className="h-10 w-full rounded-xl dark:border-slate-700 dark:bg-slate-900"><SelectValue placeholder="Hasta" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Hasta</SelectItem>{yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-300">Precio (COP)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </div>
              </div>

              <FilterSelect label="Estado" value={filters.estado} placeholder="Todos los estados" onChange={(value) => setFilters((prev) => ({ ...prev, estado: value === "all" ? "" : value }))}>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Vendido">Vendido</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
              </FilterSelect>

              <Button className="h-10 w-full rounded-xl bg-blue-600" onClick={() => { setFiltersOpen(false); setIsOpen(true) }}>
                Aplicar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isOpen && (searchTerm.length > 0 || hasActiveFilters) && (
        <div className="absolute left-0 right-0 top-full mt-2 flex max-h-[28rem] origin-top flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.slice(0, 10).map((vehicle) => (
                <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`} onClick={() => setIsOpen(false)} className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                    {vehicle.imagen ? <img src={vehicle.imagen} alt={`${vehicle.marca} ${vehicle.modelo}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Car className="h-6 w-6 text-slate-400" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-slate-900 dark:text-slate-100">{vehicle.marca} <span className="font-normal">{vehicle.modelo}</span></p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="h-5 rounded-full bg-slate-50 px-2 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{getVehicleYear(vehicle)}</Badge>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-300">${Number(vehicle.precio).toLocaleString("es-CO")}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Gauge className="h-3 w-3" />{Number(vehicle.kilometraje || 0).toLocaleString("es-CO")} km</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{vehicle.estado}</span>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">No se encontraron vehiculos</p>
                <p className="mt-1 max-w-[250px] text-sm leading-relaxed text-slate-500 dark:text-slate-400">Ajusta los filtros o intenta con terminos diferentes.</p>
              </div>
            )}
          </div>

          {filteredVehicles.length > 10 && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
              <button className="flex w-full items-center justify-center gap-1 text-center text-sm font-semibold text-blue-600 transition hover:text-blue-800 dark:text-blue-300" onClick={() => setIsOpen(false)}>
                Ver los {filteredVehicles.length} resultados en el tablero <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FilterSelect({ label, value, placeholder, onChange, children }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-600 dark:text-slate-300">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full rounded-xl dark:border-slate-700 dark:bg-slate-900">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}
